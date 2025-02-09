import mongoose from "mongoose";


const BidSchema = mongoose.Schema({
    bidAmount: {
        type: Number,
        required: [true, "Please add a bid amount"],
    },
    bidder: {
        id:{

            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        username:{
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            required: true
        }
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
        required: true,
    }
   
},{timestamps: true});


export const Bid = mongoose.model("Bid", BidSchema);


