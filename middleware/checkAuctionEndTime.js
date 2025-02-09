import { catchAsyncError } from "./catchasyncerror.js";
import ErrorHandler from "./error.js";
import { Auction } from "../models/Auction.Schema.js";
import mongoose from "mongoose";

export const checkAuctionEndTime = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid ID format.", 400));
    }

    // Find the auction by ID
    const auction = await Auction.findById(id);
    if (!auction) {
      return next(new ErrorHandler("Auction not found.", 404));
    }

    // Get the current time in UTC
  
    
    
   // Define your start, end, and current times in UTC
let startTime = new Date(auction.startTime);
let endTime = new Date(auction.endTime);
let currentTime = new Date();

// Compare if the current time is between start and end time
if (currentTime >= startTime && currentTime <= endTime) {
    console.log("Current time is within the auction time.");
} else {
    console.log("Current time is outside the auction time.");
}


    // Check if the auction has started
    if (startTime > currentTime) {
      return next(new ErrorHandler("Auction has not started yet.", 400));
    }

    // Check if the auction has ended
    if (endTime < currentTime) {
      return next(new ErrorHandler("Auction has ended.", 400));
    }

    // If everything is fine, proceed to the next middleware
    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});