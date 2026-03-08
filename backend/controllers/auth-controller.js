import { User } from "../model/user.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail} from "../resend/email.js";

export const signup = async(req,res)=>{
    const {name, email, password} = req.body;
    try{
        if(!name ||!email ||!password){
            return res.status(400).json({message:"All feilds are required"});
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now()+24*60*60*1000
        })
        await user.save();

        generateJWTToken(res,user._id);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created sucessfully",
            user:{
                ...user._doc,  //send user detailes back to user except the password
                password: undefined //ensure password is not sent back to user.
            }
        });
        
    } catch(error){
        res.status(400).json({
            success: false,
            msg: error.message
        })
    }
};

export const login = async(req,res)=>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                msg: "Invalid credentials"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                msg:"Invalid credentials"
            })
        }
        const isVerified = user.isVerified;
        if(!isVerified){
            return res.status(400).json({
                success: false,
                msg: "Email not verified"
            })
        }
        generateJWTToken(res, user._id);
        res.status(200).json({
            success: true,
            msg:"Login successfully"
        })
    } catch (error) {
        console.log("error loggin in", error);
        res.status(400).json({
            success: false,
            msg: error.msg
        });
    }
};

export const logout = async(req,res)=>{
    try{
         res.clearCookie("token");
    res.status(200).json({
        success: true,
        msg:"logged out successfully"
    });
    }catch(error){
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            msg: "Error during logout"
        });
    }
   
};

export const verifyEmail = async(req,res)=>{
    const {code}= req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now()},
        })
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified Sucessfully"
        });
    }catch(error){
        console.log("error verifing email", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;

    await user.save();
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    console.log("error sending password reset email", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async(req, res)=>{
    try{
        const {token} = req.params;
        const {password} = req.body;
        console.log(token);
        console.log(password);

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now() },
        });
        if(!user){
            return res.status(400).json({
                success: false,
                msg: "Invalid or expired reset token"
            });
        }
        const hashedPassword =  await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        
        await sendResetSuccessEmail(user.email);
        res.status(200).json({
            success:true,
            msg:"Password reset successfully"
        });
    }catch(error){
        console.log("Error resetting password", error);
        res.status(400).json({
            success: false,
            msg: error.msg
        });
    } 
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({
         success: false, message: "User not found" 
        });
    }

    res.status(200).json({ 
        success: true, 
        user: { ...user._doc, password: undefined }
     });

     
  } catch (error) {
    console.log("error checking auth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};