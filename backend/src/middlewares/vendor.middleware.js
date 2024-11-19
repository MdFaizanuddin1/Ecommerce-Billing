import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiError } from "../../utils/apiError.js";
import { Vendor } from "../models/vendor.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

dotenv.config();

export const authVendor = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.vendor_token ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.whatIsYourCompany);

    const vendor = await Vendor.findById(decodedToken?.id).select("-password ");

    if (!vendor) {
      throw new ApiError(401, "invalid vendor token");
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid vendor token");
  }
});

// const protectVendor = async (req, res, next) => {
//   let token;

//   // Check if Authorization header is provided
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     try {
//       // Get the token from header
//       token = req.headers.authorization.split(" ")[1];

//       // Verify token
//       const decoded = jwt.verify(token, SecretKey);

//       // Get vendor by ID and attach to request object
//       req.vendor = await Vendor.findById(decoded.id).select("-password");

//       if (!req.vendor) {
//         throw new ApiError(401, "Vendor not found");
//       }

//       // Call next middleware
//       next();
//     } catch (error) {
//       throw new ApiError(401, "Not authorized, token failed");
//     }
//   }

//   if (!token) {
//     throw new ApiError(401, "Not authorized, no token provided");
//   }
// };

// export { protectVendor };
