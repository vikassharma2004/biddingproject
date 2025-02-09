import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Auction } from "../models/Auction.Schema.js";
import { Bid } from "../models/Bid.Schema.js";
import { User } from "../models/User.Schema.js";

export const PlaceBid = catchAsyncError(async (req, res, next) => {
  try {
    if (req.user.role === "Auctioneer") {
      return next(new ErrorHandler("Auctioneer cannot place a bid", 403));
    }

    const { id } = req.params;
    const { bidAmount } = req.body;

    const auctionItem = await Auction.findById(id);

    if (!auctionItem) {
      return next(new ErrorHandler("Auction not found", 404));
    }

    if (!bidAmount) {
      return next(new ErrorHandler("Please add a bid amount", 400));
    }

    if (bidAmount <= auctionItem.currentPrice) {
      return next(
        new ErrorHandler("Bid amount must be greater than the current bid", 400)
      );
    }

    if (bidAmount <= auctionItem.startingPrice) {
      return next(
        new ErrorHandler("Bid amount must be greater than the starting price", 400)
      );
    }

    const existingbid = await Bid.findOne({
      "bidder.id": req.user._id,
      auction: id,
    });

    const existingbidsInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() === req.user._id.toString()
    );

    if (existingbid && existingbidsInAuction) {
      existingbidsInAuction.bidAmount = bidAmount;
      existingbid.bidAmount = bidAmount;
      await existingbid.save();
    } else {
      const bidderdetails = await User.findById(req.user._id);
      const newBid = new Bid({
        bidAmount,
        bidder: {
          id: bidderdetails._id,
          username: bidderdetails.username,
          profileImage: bidderdetails.profileImage,
        },
        auction: auctionItem._id,
      });

      auctionItem.bids.push({
        userId: req.user._id,
        username: bidderdetails.username,
        profileImage: bidderdetails.profileImage?.url,
        amount: bidAmount,
      });

      await newBid.save();
    }

    auctionItem.currentPrice = bidAmount;
    await auctionItem.save();

    res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      currentBid: auctionItem.currentPrice,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Bid placement failed", 500));
  }
});