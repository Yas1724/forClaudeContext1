import { User } from "../model/user.js";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: call Python ML service and return predicted targets
// ─────────────────────────────────────────────────────────────────────────────
const getPredictedTargets = async (profileData) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, profileData);
        return response.data;  // { calories, protein_g, carbs_g, fat_g }
    } catch (error) {
        console.error("ML service error:", error.message);
        // Fallback: basic Mifflin-St Jeor calculation if ML service is down
        return calculateFallbackTargets(profileData);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback macro calculation (Mifflin-St Jeor BMR + TDEE)
//  Used when the Python ML service is unavailable
// ─────────────────────────────────────────────────────────────────────────────
const calculateFallbackTargets = ({ age, gender, weight, height, activityLevel, goal }) => {
    // BMR
    let bmr;
    if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
        sedentary:         1.2,
        lightly_active:    1.375,
        moderately_active: 1.55,
        very_active:       1.725,
        extra_active:      1.9
    };

    let tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    // Adjust TDEE based on goal
    let calories;
    switch (goal) {
        case "lose_weight":    calories = Math.round(tdee - 500); break;
        case "gain_weight":    calories = Math.round(tdee + 300); break;
        case "build_muscle":   calories = Math.round(tdee + 200); break;
        case "maintain":
        default:               calories = Math.round(tdee);
    }

    // Macro split
    let proteinRatio, carbRatio, fatRatio;
    switch (goal) {
        case "build_muscle":
            proteinRatio = 0.35; carbRatio = 0.40; fatRatio = 0.25; break;
        case "lose_weight":
            proteinRatio = 0.40; carbRatio = 0.30; fatRatio = 0.30; break;
        case "gain_weight":
            proteinRatio = 0.25; carbRatio = 0.50; fatRatio = 0.25; break;
        default:
            proteinRatio = 0.30; carbRatio = 0.40; fatRatio = 0.30;
    }

    return {
        calories,
        protein_g: Math.round((calories * proteinRatio) / 4),
        carbs_g:   Math.round((calories * carbRatio)   / 4),
        fat_g:     Math.round((calories * fatRatio)    / 9)
    };
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/profile/setup
//  Called after signup — saves all onboarding data and gets ML targets
// ─────────────────────────────────────────────────────────────────────────────
export const setupProfile = async (req, res) => {
    const { age, height, weight, gender, goal, activityLevel, targetWeight } = req.body;

    try {
        // ── Validation ──────────────────────────────────────────────────────
        if (!age || !height || !weight || !gender || !goal) {
            return res.status(400).json({
                success: false,
                message: "Age, height, weight, gender and goal are required"
            });
        }

        const validGoals = ["lose_weight", "gain_weight", "maintain", "build_muscle"];
        if (!validGoals.includes(goal)) {
            return res.status(400).json({
                success: false,
                message: `Goal must be one of: ${validGoals.join(", ")}`
            });
        }

        if (age < 10 || age > 120)   return res.status(400).json({ success: false, message: "Invalid age" });
        if (height < 50 || height > 300) return res.status(400).json({ success: false, message: "Invalid height (cm)" });
        if (weight < 20 || weight > 500) return res.status(400).json({ success: false, message: "Invalid weight (kg)" });

        // ── Get ML-predicted targets ─────────────────────────────────────────
        const predicted = await getPredictedTargets({
            age, height, weight, gender,
            activityLevel: activityLevel || "sedentary",
            goal
        });

        // ── Save to DB ───────────────────────────────────────────────────────
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                profile: {
                    age,
                    height,
                    weight,
                    gender,
                    goal,
                    activityLevel: activityLevel || "sedentary",
                    targetWeight: targetWeight || null,
                    isOnboarded: true
                },
                dailyTargets: {
                    calories: predicted.calories,
                    protein:  predicted.protein_g,
                    carbs:    predicted.carbs_g,
                    fat:      predicted.fat_g
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile setup complete",
            profile: user.profile,
            dailyTargets: user.dailyTargets
        });

    } catch (error) {
        console.error("Error setting up profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/profile
//  Returns the full user profile and daily targets
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -verificationToken -resetPasswordToken");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            user: {
                name:         user.name,
                email:        user.email,
                profile:      user.profile,
                dailyTargets: user.dailyTargets
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/profile/update
//  Allows partial updates — recalculates targets if body metrics change
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    const { age, height, weight, gender, goal, activityLevel, targetWeight } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Merge incoming fields with existing profile
        const updatedProfile = {
            age:           age           ?? user.profile.age,
            height:        height        ?? user.profile.height,
            weight:        weight        ?? user.profile.weight,
            gender:        gender        ?? user.profile.gender,
            goal:          goal          ?? user.profile.goal,
            activityLevel: activityLevel ?? user.profile.activityLevel,
            targetWeight:  targetWeight  ?? user.profile.targetWeight,
            isOnboarded:   true
        };

        // Recalculate targets with updated data
        const predicted = await getPredictedTargets(updatedProfile);

        user.profile      = updatedProfile;
        user.dailyTargets = {
            calories: predicted.calories,
            protein:  predicted.protein_g,
            carbs:    predicted.carbs_g,
            fat:      predicted.fat_g
        };

        await user.save();

        res.status(200).json({
            success:     true,
            message:     "Profile updated",
            profile:     user.profile,
            dailyTargets: user.dailyTargets
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
