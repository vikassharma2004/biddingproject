import { catchAsyncError } from "../middleware/catchasyncerror.js";
import ErrorHandler from "../middleware/error.js";
import { PaymentProof } from "../models/PaymentProof.Schema.js";
import { User } from "../models/User.Schema.js";
import {v2 as cloudinary }from "cloudinary"

export const uploadPaymentProof = catchAsyncError(async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("payment proof is required", 400));
    }
    const { proof } = req.files;
    const { amount, comment } = req.body;
    const user = await User.findById(req.user._id);

    if (!amount || !comment) {
      return next(new ErrorHandler("Please add amount adn comment", 400));
    }
    if (user.unpaidCommissionAmount == 0) {
      return res
        .status(200)
        .json({ success: true, message: "You have no unpaid commission" });
    }
    if (user.unpaidCommissionAmount < amount) {
      return next(
        new ErrorHandler(
          "You don't have enough commission please enter less amount",
          403
        )
      );
    }

    const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedFileTypes.includes(proof.mimetype)) {
      return next(new ErrorHandler("Invalid file type", 400));
    }


    const cloudinaryresponse=await cloudinary.uploader.upload(proof.tempFilePath,{
        folder:"paymentProof",
       
      })
      if(!cloudinaryresponse || cloudinaryresponse.error){
        console.log("cloudinary error",cloudinaryresponse.error || "unknown error")
        return next(new ErrorHandler("Image upload failed", 500));
      }


      const commission =await PaymentProof.create({ 
        userId: req.user._id,
        amount,
        comment,
        proof: {
          public_id: cloudinaryresponse.public_id,
          url: cloudinaryresponse.secure_url,
        },
      });
     
      res.status(200).json({ success: true, message:"your proof has been submitted successfully . we will review it wait for 24 hours",commission });
    
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});
