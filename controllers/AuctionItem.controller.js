import mongoose from "mongoose";
import { catchAsyncError } from "../middleware/catchasyncerror.js";
import ErrorHandler from "../middleware/error.js";
import { Auction } from "../models/Auction.Schema.js";
import { User } from "../models/User.Schema.js";
import { v2 as cloudinary } from "cloudinary";
import { Bid } from "../models/Bid.Schema.js";

// Ensure Cloudinary is configured

export const createAuction = catchAsyncError(async (req, res, next) => {
  try {


if(req.user.role=="Bidder" || req.user.role=="SuperAdmin"){ 
    return next(new ErrorHandler("Only Auctioneer can create an auction", 403));
}

    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Please upload a file", 400));
    }

    const { image } = req.files;
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    // Validate image type
    if (!allowedFileTypes.includes(image.mimetype)) {
      return next(new ErrorHandler("Invalid file type", 400));
    }

    // Extract auction details from request body
    const {
      title,
      category,
      description,
      condition,
      startingPrice,
      startTime,
      endTime,
    } = req.body;
    console.log(req.body);
    

    // Check if all fields are provided
    if (
      !title ||
      !category ||
      !description ||
      !condition ||
      !startingPrice ||
      !startTime ||
      !endTime
    ) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    // Parse startTime and endTime as Date objects
console.log(startTime,endTime, new Date (Date.now()));

    const endTimeDate = new Date(endTime);
    if (isNaN(endTimeDate.getTime())) {
      return next(new ErrorHandler("Invalid endTime format", 400));
    }

    // Validate startTime
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
      return next(new ErrorHandler("Invalid startTime format", 400));
    }

    // Ensure startTime is greater than the current time
    if (startTimeDate <= new Date()) {
      return next(
        new ErrorHandler(
          "Auction start time must be greater than the current time",
          400
        )
      );
    }

    // Ensure startTime is less than endTime
    if (startTimeDate >= endTimeDate) {
      return next(
        new ErrorHandler(
          "Auction start time must be less than the end time",
          400
        )
      );
    }

    // Check if the user already has an ongoing auction
    const alreadyCreatedAuctions = await Auction.find({
      CreatedBy: req.user._id,
      endTime: { $gt: new Date() }, // Ensure endTime is greater than the current time
    });

    if (alreadyCreatedAuctions.length > 0) {
      return next(new ErrorHandler("You already have an active auction", 400));
    }

    // Upload image to Cloudinary
    const cloudinaryresponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "Auction_images",
      }
    );

    if (!cloudinaryresponse || cloudinaryresponse.error) {
      console.log(
        "Cloudinary Error:",
        cloudinaryresponse.error || "Unknown error"
      );
      return next(new ErrorHandler("Image upload failed", 500));
    }

    // Create Auction Item
    const AuctionItem = await Auction.create({
      title,
      category,
      description,
      condition,
      startingPrice,
      startTime: startTimeDate, // Use parsed Date object
      endTime: endTimeDate, // Use parsed Date object
      image: {
        public_id: cloudinaryresponse.public_id,
        url: cloudinaryresponse.secure_url,
      },
      CreatedBy: req.user._id,
    });

    // Send Response
    return res.status(201).json({
      success: true,
      message: `Auction created successfully and will be listed on page at ${startTimeDate}`,
      AuctionItem,
    });
  } catch (error) {
    console.log("Internal Server Error:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const GetAllItems = catchAsyncError(async (req, res, next) => {
  try {
    const AllItems = await Auction.find();
    return res.status(200).json({ success: true, AllItems });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const GetAucctionDetails = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid Auction ID", 400));
    }
    const AuctionDetails = await Auction.findById(id);

    if (!AuctionDetails) {
      return next(new ErrorHandler("Auction not found", 404));
    }
    const bidders = AuctionDetails.bids.sort(
      (a, b) => b.bidAmount - a.bidAmount
    );
    return res.status(200).json({ success: true, AuctionDetails, bidders });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const getMyAuctions = catchAsyncError(async (req, res, next) => {
  try {
    const MyAuctions = await Auction.find({ CreatedBy: req.user._id });
    return res.status(200).json({ success: true, MyAuctions });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const RepublishAuction = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid Auction ID", 400));
    }
    let AuctionItem = await Auction.findById(id);

    if (!AuctionItem) {
      return next(new ErrorHandler("Auction not found", 404));
    }

    if (AuctionItem.endTime > Date.now()) {
      return next(
        new ErrorHandler(
          "Auction is already active and cannot be republished",
          400
        )
      );
    }
    let data = {
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
    };
    if (data.startTime < Date.now()) {
      return next(
        new ErrorHandler(
          "Auction start time must be greater than the current time",
          400
        )
      );
    }
    if (data.startTime >= data.endTime) {
      return next(
        new ErrorHandler(
          "Auction start time must be less than the end time",
          400
        )
      );
    }

    if(AuctionItem.HighestBidder){
      const highestBidder = await User.findById(AuctionItem.HighestBidder);
      highestBidder.moneyspent-=AuctionItem.currentPrice;
      highestBidder.unpaidCommissionAmount = 0;
      highestBidder.auctionswon-=1;

      await highestBidder.save();
    }

    data.bids = [];
    data.commissionCalculated = false;
    data.currentPrice=0;
    data.HighestBidder=null;

    if(!req.body.startTime || !req.body.endTime){
      return next (new ErrorHandler("startime and endtime for republish is required ", 400))
    }
    AuctionItem = await Auction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      usefindAndModify: false,
    });

    await Bid.deleteMany({ auction: AuctionItem._id });

    const createdBy = await User.findById(req.user.id);
    createdBy.unpaidCommissionAmount = 0;
    await createdBy.save();
    return res.status(200).json({ success: true, AuctionItem });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const DeleteAuction = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid Auction ID", 400));
    }
    const AuctionDetails = await Auction.findById(id);
    if (!AuctionDetails) {
      return next(new ErrorHandler("Auction not found", 404));
    }

    await AuctionDetails.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Auction deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});
