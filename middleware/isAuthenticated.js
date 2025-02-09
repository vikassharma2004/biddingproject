import jwt from "jsonwebtoken";
import { User } from "../models/User.Schema.js";
import { catchAsyncError } from "./catchasyncerror.js";
import ErrorHandler from "./error.js";


export const isAuthorizedRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is logged in
    if (!req.user) {
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    // If everything is fine, proceed
    next();
  };
};



export const authenticateUser = catchAsyncError(async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    // Debugging: Log the token
    

    // Check if token exists
    if (!token) {
      return next(new ErrorHandler("USER NOT AUTHENTICATED", 401));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Debugging: Log the decoded token payload
   

    // Find the user in the database
    const user = await User.findById(decoded.id).select("-password");

    // Debugging: Log the user
    

    // Check if user exists
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
    // Attach the user to the request object

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Authentication Error:", error); // Debugging
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});