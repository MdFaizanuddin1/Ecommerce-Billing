import { asyncHandler } from "../../../utils/asyncHandler.js";

// Middleware to ensure only admins or managers can modify bills
const allowOnlyAdminOrManager = asyncHandler(async (req, res, next) => {
  // Check if user is admin or manager
  if (req.user && (req.user.role === "Admin" || req.user.role === "Manager")) {
    return next(); // Allow to proceed if Admin or Manager
  }
  throw new ApiError(
    403,
    "Access denied: Only Admins or Managers can modify bills"
  );
});

export { allowOnlyAdminOrManager };
