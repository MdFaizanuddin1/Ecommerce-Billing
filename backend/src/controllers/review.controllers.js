import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

import { Review } from "../models/review.models.js";

const AddReview = asyncHandler(async (req, res) => {
  const { fullName, email, stars, reviewTitle, review, recommended } = req.body;

  const newReview = await Review.create({
    fullName,
    email,
    stars,
    reviewTitle,
    review,
    recommended,
  });

  const createdReview = await Review.findById(newReview._id);

  if (!createdReview) {
    throw new ApiError(400, "Review creation failed");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, createdReview, "Review created successfully"));
});

const getReview = asyncHandler(async (req, res) => {
  const review = await Review.find();
  if (!review) {
    throw new ApiError(400, "NO reviews found");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, review, "Review fetched successfully"));
});

export { AddReview, getReview };
