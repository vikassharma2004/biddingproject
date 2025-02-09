import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a name"],
      minlength: [3, "Name should be more than 3 characters"],
      maxlength: [20, "Name should be less than 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      selected: false,
      required: [true, "Please add a password"],
      minlength: [6, "Password should be more than 6 characters"],
    
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    phonenumber: {
      type: Number,
      required: [true, "Please add a phone number"],
      minlength: [10, "ENTER A VALID PHONE NUMBER"],
      maxlength: [10, "ENTER A VALID PHONE NUMBER"],
    },
    profileImage: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    paymentmethods: {
      banktransfer: {
        bankAccuntNumber: String,
        bankName: String,
        bankAccountHolderName: String,
      },
      paypal: {
        paypalEmail: String,
      },
    },
    role: {
      type: String,
      enum: ["Auctioneer", "Bidder", "SuperAdmin"],
    },
    unpaidCommissionAmount: {
      type: Number,
      default: 0,
    },
    auctionwon: {
      type: Number,
      default: 0,
    },
    moneyspent: {
      type: Number,
      default: 0,
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", UserSchema);
