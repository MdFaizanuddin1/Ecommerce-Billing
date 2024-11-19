import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

import { Cart } from "../models/cart.models.js";
import { Product } from "../models/products.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

// // const addTocart = asyncHandler(async (req, res) => {
// //   const { productId } = req.params;
// //   const { userId, productname, price } = req.body;

// //   if (!userId || !productId || !productname || !price) {
// //     return res
// //       .status(400)
// //       .send(new ApiError(400, "Invalid request. Missing required fields."));
// //   }
// //   // Check if the product is already in the cart for this user
// //   let cartItem = await Cart.findOne({ userId, productId });

// //   if (cartItem) {
// //     // If product exists in cart, increment the quantity
// //     cartItem.quantity += 1;
// //   } else {
// //     // If not, create a new cart item with quantity 1
// //     cartItem = new Cart({ userId, productId, productname, price, quantity: 1 });
// //   }

// //   const savedCartItem = await cartItem.save();
// //   return res
// //     .status(200)
// //     .send(new ApiResponse(200, savedCartItem, "product added to cart"));
// // });
// const addTocart = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const { userId } = req.body;
//   if (!userId) {
//     throw new ApiError(400, "invalid request missing required details");
//   }
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(400, "Invalid user");
//   }
//   const product = await Product.findById(productId);
//   if (!product) {
//     throw new ApiError(400, "Invalid request");
//   }

//   // retrive data from product models
//   const productname = product.productname;
//   const price = product.price;

//   // Use findOneAndUpdate for atomic increment or creation if the item doesn't exist
//   const updatedCartItem = await Cart.findOneAndUpdate(
//     { userId, productId }, // Search criteria
//     {
//       $inc: { quantity: 1 }, // Increment quantity by 1 if exists
//       $setOnInsert: { userId, productId, productname, price }, // Insert details if not found
//     },
//     { new: true, upsert: true } // Return the updated document, create if not found
//   );

//   // Return success response
//   return res
//     .status(201) // 201 for creation/update
//     .send(
//       new ApiResponse(
//         201,
//         updatedCartItem,
//         "Product added to cart successfully"
//       )
//     );
// });

// // const getCartData1 = async (req, res) => {
// //   const userId = req.query.userId; // Get userId from query parameters
// //   // console.log('Received userId:', userId, 'Type:', typeof userId); // Debugging line

// //   try {
// //     if (!mongoose.Types.ObjectId.isValid(userId)) {
// //       return res.status(400).json({ error: "Invalid userId" });
// //     }

// //     // console.log('Fetching cart data for userId:', userId); // Debugging line
// //     // Correctly use new mongoose.Types.ObjectId to ensure the userId is in the right format
// //     const objectId = new mongoose.Types.ObjectId(userId);
// //     const cartItems = await Cart.find({ userId: objectId }).populate(
// //       "productId"
// //     );
// //     // console.log('Cart items fetched:', cartItems); // Debugging line
// //     res.json(cartItems); // Ensure this sends a valid JSON response
// //   } catch (error) {
// //     console.error("Error fetching cart data:", error);
// //     res.status(500).json({ error: "Error fetching cart data" }); // Return error as JSON
// //   }
// // };

// const getCartData = asyncHandler(async (req, res) => {
//   const { userId } = req.params;

//   // Check if userId is provided
//   if (!userId) {
//     throw new ApiError(400, "invalid request missing required details");
//   }

//   const cartItems = await Cart.find({ userId }).populate(
//     "productId",
//     "productname price image"
//   ); // Populate product details

//   if (!cartItems || cartItems.length === 0) {
//     return res
//       .status(200)
//       .send(new ApiResponse(200, {}, "No items in the cart"));
//   }
//   return res
//     .status(200)
//     .send(new ApiResponse(200, cartItems, "cart items fetched successfully"));
// });

// const decreaseQuantity = asyncHandler(async (req, res) => {
//   const productId = req.params.productId;
//   const { userId } = req.body;

//   let cartItem = await Cart.findOne({ userId, productId });

//   if (!cartItem) {
//     throw new ApiError(400, "No cart item was found");
//   }

//   if (cartItem.quantity > 1) {
//     cartItem.quantity -= 1;
//     const item = await cartItem.save();
//     res
//       .status(200)
//       .send(new ApiResponse(200, item, "decreased the quantity successfully"));
//   } else {
//     const item = await Cart.deleteOne({ userId, productId });
//     res.status(200).send(new ApiResponse(200, item, "Item removed from cart"));
//   }
// });

// const clearCart = asyncHandler(async (req, res) => {
//   const userId = req.query.userId; // Get userId from query parameters
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     throw new ApiError(400, "invalid user id");
//   }
//   try {
//     const result = await Cart.deleteMany({ userId: userId });
//     if (result.deletedCount > 0) {
//       return res
//         .status(200)
//         .send(new ApiResponse(200, result, "Cart cleared successfully"));
//     } else {
//       return res
//         .status(200)
//         .send(new ApiResponse(200, result, "Cart is already empty"));
//     }
//   } catch (error) {
//     throw new ApiError(400, "something went wrong while clearing cart");
//   }
// });

// ---------- middleware auth user ----------------

const addTocart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  // const { userId } = req.body;
  const userId = req.user._id;
  // console.log(userId);
  if (!userId) {
    throw new ApiError(400, "invalid request missing unauthorized");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "Invalid user");
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Invalid request");
  }

  // retrive data from product models
  const productname = product.productname;
  const price = product.price;
  const image = product.image;

  // Use findOneAndUpdate for atomic increment or creation if the item doesn't exist
  const updatedCartItem = await Cart.findOneAndUpdate(
    { userId, productId }, // Search criteria
    {
      $inc: { quantity: 1 }, // Increment quantity by 1 if exists
      $setOnInsert: { userId, productId, productname, price, image }, // Insert details if not found
    },
    { new: true, upsert: true } // Return the updated document, create if not found
  );

  // Return success response
  return res
    .status(201) // 201 for creation/update
    .send(
      new ApiResponse(
        201,
        updatedCartItem,
        "Product added to cart successfully"
      )
    );
});

// const getCartData1 = async (req, res) => {
//   const userId = req.query.userId; // Get userId from query parameters
//   // console.log('Received userId:', userId, 'Type:', typeof userId); // Debugging line

//   try {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid userId" });
//     }

//     // console.log('Fetching cart data for userId:', userId); // Debugging line
//     // Correctly use new mongoose.Types.ObjectId to ensure the userId is in the right format
//     const objectId = new mongoose.Types.ObjectId(userId);
//     const cartItems = await Cart.find({ userId: objectId }).populate(
//       "productId"
//     );
//     // console.log('Cart items fetched:', cartItems); // Debugging line
//     res.json(cartItems); // Ensure this sends a valid JSON response
//   } catch (error) {
//     console.error("Error fetching cart data:", error);
//     res.status(500).json({ error: "Error fetching cart data" }); // Return error as JSON
//   }
// };

const getCartData = asyncHandler(async (req, res) => {
  // const { userId } = req.params;

  // Check if userId is provided
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "invalid request missing unauthorized");
  }

  const cartItems = await Cart.find({ userId });
  // .populate(
  //   "productId",
  //   "productname price image"
  // ); // Populate product details

  if (!cartItems || cartItems.length === 0) {
    return res
      .status(200)
      .send(new ApiResponse(200, {}, "No items in the cart"));

    // throw new ApiError(400, "No items in the cart");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, cartItems, "cart items fetched successfully"));
});

const decreaseQuantity = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  // const { userId } = req.body;

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "invalid request missing unauthorized");
  }

  let cartItem = await Cart.findOne({ userId, productId });

  if (!cartItem) {
    throw new ApiError(400, "No cart item was found");
  }

  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
    const item = await cartItem.save();
    const cart = await Cart.find({ userId });
    res.status(200).send(
      new ApiResponse(
        200,
        // { item, cart },
        item,
        "decreased the quantity successfully"
      )
    );
  } else {
    const item = await Cart.deleteOne({ userId, productId });
    res.status(200).send(new ApiResponse(200, item, "Item removed from cart"));
  }
});

const clearCart = asyncHandler(async (req, res) => {
  // const userId = req.query.userId; // Get userId from query parameters
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "invalid request missing unauthorized");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "invalid user id");
  }
  try {
    const result = await Cart.deleteMany({ userId: userId });
    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send(new ApiResponse(200, result, "Cart cleared successfully"));
    } else {
      return res
        .status(200)
        .send(new ApiResponse(200, result, "Cart is already empty"));
    }
  } catch (error) {
    throw new ApiError(400, "something went wrong while clearing cart");
  }
});

export { addTocart, getCartData, decreaseQuantity, clearCart };
