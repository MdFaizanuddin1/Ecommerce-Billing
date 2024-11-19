import mongoose, { Schema } from "mongoose";

const wishListSchema = new Schema(
  {
    name: {
      type: String,
      default: "favorites", // Default value if not provided
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

export const WishList = mongoose.model("WishList", wishListSchema);
