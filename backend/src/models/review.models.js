import mongoose, { Schema } from "mongoose";

const reviewScema = mongoose.Schema(
  {
    fullName: {
      type: String,
      Required: true,
    },
    email: {
      type: String,
      Required: true,
    },
    stars: {
      type: String,
      Required: true,
    },
    reviewTitle: {
      type: String,
      Required: true,
    },
    review: {
      type: String,
      Required: true,
    },
    recommended: {
      type: Boolean,
      Required: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewScema);
