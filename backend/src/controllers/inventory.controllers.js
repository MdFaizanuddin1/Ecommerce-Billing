import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Product } from "../models/products.models.js";

// Function to increase stock
const restockProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) throw new ApiError(404, "Product not found");

    const productStockBeforeAdd = product.stock;
    product.stock += Number(quantity);
    product.restockedAt = Date.now();

    product.stockHistory.push({
      quantityChanged: quantity,
      changeReason: "Restocked",
    });

    await product.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { productStockBeforeAdd, stock: product.stock },
          `produt restocked : product Stock Before Add ${productStockBeforeAdd} and aftera adding stock is ${product.stock}`
        )
      );
  } catch (error) {
    throw new ApiError(400, "restock product failed");
  }
};

// Function to check low stock and alert
const checkLowStock = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new ApiError(400, "product id is required");
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "product with the given id is not found");
  }

  if (product.stock <= product.lowStockThreshold) {
    // Trigger alert or notification
    console.log(`Product ${product.productname} is running low on stock!`);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product.stock,
        product.stock <= product.lowStockThreshold
          ? `Product ${product.productname} is running low on stock!`
          : `Product ${product.productname} stock is ${product.stock}`
      )
    );
});

// Controller function to get stock details
const getStockDetails = asyncHandler(async (req, res) => {
  // Fetch all products from the database
  const products = await Product.find({});

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  // Prepare stock details and calculate total stock value
  const stockDetails = products.map((product) => {
    const stockValue = product.price * product.stock;
    return {
      id: product._id,
      name: product.productname,
      barcode: product.barcodeNumber,
      price: product.price,
      stock: product.stock,
      stockValue,
    };
  });

  // Calculate the total stock value across all products
  const totalStockValue = stockDetails.reduce(
    (acc, product) => acc + product.stockValue,
    0
  );
  let count = 0;
  const totalNumberOfProducts = stockDetails.length;

  // Return the stock details along with the total stock value
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { stockDetails, totalStockValue, totalNumberOfProducts },
        "Stock details fetched successfully"
      )
    );
});

export { restockProduct, checkLowStock, getStockDetails };
