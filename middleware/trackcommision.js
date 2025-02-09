import { User } from "../models/User.Schema.js";
import { catchAsyncError } from "./catchasyncerror.js";
import ErrorHandler from "./error.js";

export const trackCommissionStatus = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.unpaidCommission > 0) {
      return next(
        new ErrorHandler(
          "You have unpaid commissions. Please pay them before posting a new auction.",
          403
        )
      );
    }
    next();
  }
);