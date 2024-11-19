import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export const healthCheck = async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(201, {}, "server is running"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "server is not working"));
  }
};
