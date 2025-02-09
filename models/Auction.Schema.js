import mongoose from "mongoose";
const AuctionSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a name"],
    minlength: [3, "Name should be more than 3 characters"],
    trim: true,
    maxlength: [50, "Name should not be more than 50 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description should not be more than 500 characters"],
  },
  category: {
    type: String,
  },
  condition: {
    type: String,
    enum: ["New", "Used"],
  },
  image: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  startingPrice: {
    type: Number,
    required: [true, "Please add a starting price"],
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date, // Changed to Date
    required: [true, "Please add a start date"],
  },
  endTime: {
    type: Date, // Changed to Date
    required: [true, "Please add an end date"],
  },
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bids: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
        required: true,
      },
      username: {
        type: String,
        trim: true,
      },
      profileImage: {
        type: String,
      },
      amount: {
        type: Number,
      },
    },
  ],
  HighestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  commissionCalculated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Auction = mongoose.model("Auction", AuctionSchema);