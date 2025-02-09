import { catchAsyncError } from "../middleware/catchasyncerror.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/User.Schema.js";
import {v2 as cloudinary }from "cloudinary"
import { generatetoken } from "../utils/jwtToken.js";

export const registerUser =  catchAsyncError(async(req, res, next) => {
  try {
    
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Please upload a file", 400));
    }

    const { profileImage } = req.files;
    const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedFileTypes.includes(profileImage.mimetype)) {
      return next(new ErrorHandler("Invalid file type", 400));
    }

    const {
      username,
      password,
      email,
      address,
      phonenumber,
      role,
      bankAccuntNumber,
      bankName,
      bankAccountHolderName,
      paypalEmail,
    } = req.body;


    if (!username || !password || !email || !address || !phonenumber || !role) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    if (role == "Auctioneer")
      if (
        !bankAccuntNumber ||
        !bankName ||
        !bankAccountHolderName ||
        !paypalEmail
      ) {
        return next(new ErrorHandler("Please provide full bank details", 400));
      }

      const isregistered=await User.findOne({email})
      if(isregistered){
        return next(new ErrorHandler("User already registered", 400));
      }

      const cloudinaryresponse=await cloudinary.uploader.upload(profileImage.tempFilePath,{
        folder:"userassets",
       
      })
      if(!cloudinaryresponse || cloudinaryresponse.error){
        console.log("cloudinary error",cloudinaryresponse.error || "unknown error")
        return next(new ErrorHandler("Image upload failed", 500));
      }

      const user = await User.create({
        username,
        password,
        email,
        address,
        phonenumber,
        role,
       
        profileImage: {
          public_id: cloudinaryresponse.public_id,
          url: cloudinaryresponse.secure_url
        },
        paymentmethods: {
          banktransfer: {
            bankAccuntNumber,
            bankName,
            bankAccountHolderName
          },
          paypal: {
            paypalEmail
          },
        },
      });  
      generatetoken(user, "User registered successfully", 201, res)
      
      
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
);



export const loginUser = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password} = req.body;
    
    
    if (!email || !password ) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }
    generatetoken(user, "User logged in successfully", 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const GetProfile = catchAsyncError(async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user });
});

export const getLeaderBoard= catchAsyncError(async(req,res,next)=>{
try {
  const users=await User.find({ moneyspent:{$gte:0} })
  const leaderboard=users.sort((a,b)=>b.moneyspent-a.moneyspent)  /// a-b b grater type
  res.status(200).json({success:true,leaderboard})

} catch (error) {
  
}
})

export const logout= catchAsyncError(async(req,res,next)=>{
    res.cookie("token", "", {
      expires: new Date(Date.now()),
     
    });
    res.status(200).json({ success: true, message: "Logout successfull" });
  })
