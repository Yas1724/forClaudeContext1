import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },

    // ─── Onboarding / Goal Profile ───────────────────────────────────────────
    profile: {
        age:    { type: Number, default: null },
        height: { type: Number, default: null },   // cm
        weight: { type: Number, default: null },   // kg
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: null
        },
        goal: {
            type: String,
            enum: ["lose_weight", "gain_weight", "maintain", "build_muscle"],
            default: null
        },
        activityLevel: {
            type: String,
            enum: ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"],
            default: "sedentary"
        },
        targetWeight:   { type: Number, default: null },   // kg  (like the Cal AI slider)
        isOnboarded:    { type: Boolean, default: false }
    },

    // ─── Calorie / Macro Targets (set after ML prediction) ───────────────────
    dailyTargets: {
        calories: { type: Number, default: null },
        protein:  { type: Number, default: null },   // g
        carbs:    { type: Number, default: null },   // g
        fat:      { type: Number, default: null }    // g
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
