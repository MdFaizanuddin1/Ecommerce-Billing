import jwt from "jsonwebtoken";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { AdminManeger } from "../../models/admin/admin-maneger.models.js";
import { ApiError } from "../../../utils/apiError.js";

const protectAdminManager = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies (web) or Authorization header (mobile)
  if (req.cookies && req.cookies.admin_manger_token) {
    token = req.cookies.admin_manger_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Authorization header (mobile)
    token = req.headers.authorization.split(" ")[1];
  }

  // If token is not found in cookies or Authorization header, return unauthorized
  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by id and attach it to the request
    const user = await AdminManeger.findById(decoded.id).select("-password");
    req.user = user;
    req.user.role = user.role;

    if (!req.user) {
      throw new ApiError(404, "User not found");
    }

    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, token failed");
  }
});

export { protectAdminManager };
