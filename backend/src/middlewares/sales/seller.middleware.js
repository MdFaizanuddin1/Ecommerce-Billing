import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { SalesPerson } from "../../models/sales/seller.models.js";

dotenv.config();

export const authSeller = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.seller_token ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await SalesPerson.findById(decodedToken?.id).select(
      "-password "
    );

    if (!seller) {
      throw new ApiError(401, "invalid seller token");
    }
    //-----------

    // req.seller = seller;
    // req.selle.role = seller.role;
    req.user =seller
    req.user.role = seller.role
    ////////--------------
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid seller token");
  }
});
