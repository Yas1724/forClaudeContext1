import { User } from "../model/user.js";

/**
 * requireOnboarding
 * Middleware that blocks access to protected routes (dashboard, logs, etc.)
 * until the user has completed the profile setup flow.
 *
 * Usage: router.get('/dashboard', verifyToken, requireOnboarding, handler)
 */
export const requireOnboarding = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("profile");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (!user.profile?.isOnboarded) {
            return res.status(403).json({
                success: false,
                message:  "Profile setup required",
                redirect: "/onboarding"    // frontend uses this to redirect
            });
        }
        next();
    } catch (error) {
        console.error("requireOnboarding error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
