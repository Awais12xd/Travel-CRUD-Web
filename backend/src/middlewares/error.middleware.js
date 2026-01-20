import { errorHandler } from "../utils/errorHandler.js";

export const errorMiddle = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  //wrong mongoDb id
  if (err.name === "CastError") {
    const message = `resource not found with this id . invalid : ${err.path}`;
    err = new errorHandler(message, 400);
  }

  //duplicate key
  if (err.code === 11000) {
    const message = `duplicate key error for ${Object.keys(
      err.keyValue
    )} Entered`;
    err = new errorHandler(message, 400);
  }

  //jwt error
  if (err.name === "JsonWebTokenError") {
    const message = "invalid token , please login again later";
    err = new errorHandler(message, 401);
  }

  //jwt expired
  if (err.name === "TokenExpiredError") {
    const message = "token has expired , please try again later";
    err = new errorHandler(message, 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
