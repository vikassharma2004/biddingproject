import { catchAsyncError } from "../middleware/catchasyncerror.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/User.Schema.js";
import { Commission } from "../models/Commison.Schema.js";
import mongoose from "mongoose";
import { Auction } from "../models/Auction.Schema.js";
import { PaymentProof } from "../models/PaymentProof.Schema.js";



export const deleteAuctionItem = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid Id format.", 400));
    }
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return next(new ErrorHandler("Auction not found.", 404));
    }
    await auctionItem.deleteOne();
    res.status(200).json({
      success: true,
      message: "Auction item deleted successfully.",
    });
  });
  
  export const getAllPaymentProofs = catchAsyncError(async (req, res, next) => {
    let paymentProofs = await paymentProofs.find();
    res.status(200).json({
      success: true,
      paymentProofs,
    });
  });
  
  export const getPaymentProofDetail = catchAsyncError(
    async (req, res, next) => {
      const { id } = req.params;
      const paymentProofDetail = await PaymentProof.findById(id);
      res.status(200).json({
        success: true,
        paymentProofDetail,
      });
    }
  );
  
  export const updateProofStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { amount, status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid ID format.", 400));
    }
    let proof = await PaymentProof.findById(id);
    if (!proof) {
      return next(new ErrorHandler("Payment proof not found.", 404));
    }
    proof = await PaymentProof.findByIdAndUpdate(
      id,
      { status, amount },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
      message: "Payment proof amount and status updated.",
      proof,
    });
  });
  
  export const deletePaymentProof = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const proof = await PaymentProof.findById(id);
    if (!proof) {
      return next(new ErrorHandler("Payment proof not found.", 404));
    }
    await proof.deleteOne();
    res.status(200).json({
      success: true,
      message: "Payment proof deleted.",
    });
  });
  
  export const fetchAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          role: "$_id.role",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);
  
    const bidders = users.filter((user) => user.role === "Bidder");
    const auctioneers = users.filter((user) => user.role === "Auctioneer");
  
    const tranformDataToMonthlyArray = (data, totalMonths = 12) => {
      const result = Array(totalMonths).fill(0);
  
      data.forEach((item) => {
        result[item.month - 1] = item.count;
      });
  
      return result;
    };
  
    const biddersArray = tranformDataToMonthlyArray(bidders);
    const auctioneersArray = tranformDataToMonthlyArray(auctioneers);
  
    res.status(200).json({
      success: true,
      biddersArray,
      auctioneersArray,
    });
  });
  
  export const monthlyRevenue = catchAsyncError(async (req, res, next) => {
    const payments = await Commission.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
  
    const tranformDataToMonthlyArray = (payments, totalMonths = 12) => {
      const result = Array(totalMonths).fill(0);
  
      payments.forEach((payment) => {
        result[payment._id.month - 1] = payment.totalAmount;
      });
  
      return result;
    };
  
    const totalMonthlyRevenue = tranformDataToMonthlyArray(payments);
    res.status(200).json({
      success: true,
      totalMonthlyRevenue,
    });
  });
