// import { asyncHandler } from "../../utils/asyncHandler.js";
// import { ApiError } from "../../utils/apiError.js";
// import { ApiResponse } from "../../utils/apiResponse.js";

// import { WishList } from "../models/wishList.models.js";
// import { Product } from "../models/products.models.js";
// import mongoose from "mongoose";

// const addToWishList = asyncHandler(async (req, res) => {
//   const { userId, name } = req.body;
//   const { productId } = req.params;

//   if (!userId || !productId) {
//     throw new ApiError(400, "Error userid and product id are required");
//   }

//   const product = await Product.findById(productId);
//   if (!product) {
//     throw new ApiError(404, "Product not found");
//   }

//   let wishListItem = await WishList.findOne({ userId, productId  }).populate(
//     "productId"
//   );

//   if (wishListItem) {
//     return res
//       .status(200)
//       .send(
//         new ApiResponse(
//           200,
//           wishListItem,
//           "The specified item is already in wishlist ."
//         )
//       );
//   }

//   wishListItem = new WishList({ userId, productId ,name});
//   await wishListItem.save();

//   // Populate after saving
//   await wishListItem.populate("productId");

//   return res
//     .status(200)
//     .send(
//       new ApiResponse(200, wishListItem, "Item added to wishlist successfully")
//     );
// });

// const getWishList = asyncHandler(async (req, res) => {
//   const userId = req.query.userId; // Get userId from query parameters
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     throw new ApiError(404, "User id is invalid");
//   }
//   const wishIems = await WishList.find({ userId });
//   if (!wishIems) {
//     throw new ApiError(500, "Internal error cannot find wishlist items");
//   }
//   return res
//     .status(200)
//     .send(
//       new ApiResponse(200, wishIems, "WishList items fetched successfully")
//     );
// });

// const deleteWishList = asyncHandler(async (req, res) => {
//   const wishlistId = req.params.wishlistId;
//   const deletedWishlist = await WishList.findByIdAndDelete(wishlistId);
//   if (!deletedWishlist) {
//     throw new ApiError(400, "Wish list not found");
//   }
//   return res
//     .status(200)
//     .send(
//       new ApiResponse(200, deleteWishList, "Wish list is deleted successfull")
//     );
// });

// export { addToWishList, getWishList, deleteWishList };

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { WishList } from "../models/wishList.models.js";
import { Product } from "../models/products.models.js";
import mongoose from "mongoose";

// Add to Wishlist by name
const addToWishList = asyncHandler(async (req, res) => {
  const { userId, name = "favorites" } = req.body; // Name of the wishlist provided by user
  const { productId } = req.params;

  if (!userId || !productId) {
    throw new ApiError(400, "Error: userId and productId are required");
  }

  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Find if the user already has a wishlist with the given name and product
  let wishListItem = await WishList.findOne({
    userId,
    productId,
    name,
  }).populate("productId");

  if (wishListItem) {
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          wishListItem,
          "The specified item is already in this wishlist."
        )
      );
  }

  // If not in the wishlist, create a new entry
  wishListItem = new WishList({ userId, productId, name });
  await wishListItem.save();

  // Populate product details after saving
  await wishListItem.populate("productId");

  return res
    .status(200)
    .send(
      new ApiResponse(200, wishListItem, "Item added to wishlist successfully")
    );
});

// Get WishList by userId and name
const getWishList = asyncHandler(async (req, res) => {
  const { userId, name } = req.query; // Get userId and name from query parameters

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User ID is invalid");
  }

  // Find wish list items by userId and name
  const wishItems = await WishList.find({ userId, name }).populate("productId");

  if (!wishItems || wishItems.length === 0) {
    throw new ApiError(
      404,
      "No wishlist items found for this user and wishlist name"
    );
  }

  return res
    .status(200)
    .send(
      new ApiResponse(200, wishItems, "Wishlist items fetched successfully")
    );
});

// Delete WishList by userId and name
const deleteWishList = asyncHandler(async (req, res) => {
  const { userId, name } = req.body; // Get userId and name from body

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User ID is invalid");
  }

  // Delete wishlist based on userId and name
  const deletedWishlist = await WishList.deleteMany({ userId, name });

  if (!deletedWishlist.deletedCount) {
    throw new ApiError(
      404,
      "No wishlist found with the specified name and userId"
    );
  }

  return res
    .status(200)
    .send(
      new ApiResponse(200, deletedWishlist, "Wishlist deleted successfully")
    );
});

const getAllWishList = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "Invalid User id");
  }

  const wishList = await WishList.find({ userId }).populate("productId");
  if (!wishList) {
    throw new ApiError(400, "No wish list is found");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, wishList, "all names found successfully"));
});

export { addToWishList, getWishList, deleteWishList, getAllWishList };
