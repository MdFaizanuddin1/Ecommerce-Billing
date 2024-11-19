// import jwt from "jsonwebtoken";
// import { ApiError } from "./apiError.js";

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.access_token;

//   if (!token) return next(new ApiError(401, "Unauthorized"));

//   jwt.verify(token, process.env.Key_Secret, (err, user) => {
//     if (err) return next(new ApiError(403, "Forbidden"));

//     req.user = user;
//     next();
//   });
// };

import jwt from "jsonwebtoken";
import { ApiError } from "./apiError.js";
import { User } from "../src/models/user.models.js";
import { asyncHandler } from "./asyncHandler.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  // const token = req.cookies.access_token;

  // if (!token) return next(new ApiError(401, "Unauthorized"));

  // jwt.verify(token, process.env.Key_Secret, (err, user) => {
  //   if (err) return next(new ApiError(403, "Forbidden"));

  //   const user = User.findById (user.id)
  //   if(!user) {
  //     throw new ApiError (404, 'invalid user token')
  //   }

  //   req.user = user;
  //   next();
  // });

  const token =
    req.cookies?.access_token ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedToken?.id).select("-password ");

  if (!user) {
    throw new ApiError(401, "invalid user token");
  }
  //-----------

  req.user = user;

  ////////--------------
  next();
});
