import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { upload1 } from "../middlewares/multer.middlrewares";
import { Firm } from "../models/firm.models";

const addFirm = asyncHandler(async (req, res) => {
    const { brandName, category, offer } = req.body;
});
const deleteFirm = asyncHandler(async (req, res) => {});
