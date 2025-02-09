class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}

export const errormiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  if (err.name === "JsonWebTokenError") {
    const message = "JsonWebToken invalid , Try again";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = "token expired, Try again";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "CastError") {
    const message = "JsonWebToken invalid , Try again";
    err = new ErrorHandler(message, 400);
  }
  const errormessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errormessage,
  });
};

export default ErrorHandler;
