import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Product } from "../models/products.models.js";
// import { Vendor } from "../models/vendor.models.js";
// import { Firm } from "../models/firm.models.js";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { AdminManeger } from "../models/admin/admin-maneger.models.js";

const addProduct = asyncHandler(async (req, res) => {
  const {
    productname,
    price,
    // category,
    bestseller,
    description,
    age,
    gender,
    stock,
    barcodeNumber,
  } = req.body;

  if (
    [
      productname,
      price,
      // category,
      bestseller,
      description,
      age,
      gender,
      stock,
      barcodeNumber,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // console.log("req.body:", req.body);
  // console.log("req.files is", req.files);
  const images = req.files?.image;
  // console.log(images)
  let image = [];
  images?.forEach((img) => {
    // console.log(img);
    // console.log(req.protocol, "\n", `${req.get("host")}`);
    const imageUrl = `${req.protocol}://${req.get("host")}/${img.filename}`;

    // console.log(imageUrl);
    image.push(imageUrl);
  });
  // console.log(image);

  if (image.length < 0) {
    throw new ApiError(500, "Error while uploading image");
  }

  const product = await Product.create({
    productname,
    price,
    // category,
    bestseller,
    description,
    image,
    age,
    gender,
    stock,
    barcodeNumber,
  });

  const createdProduct = await Product.findById(product._id);

  if (!createdProduct) {
    throw new ApiError(500, "something went wrong while adding the product");
  }
  return res
    .status(200)
    .send(new ApiResponse(201, product, "product added successfully"));
});

const deleteProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Get the product ID from request params
  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  // Validate productId format (Optional, but recommended)
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID format");
  }

  const deleledProduct = await Product.findByIdAndDelete(productId);
  if (!deleledProduct) {
    throw new ApiError(404, "product deletion failed");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, deleledProduct, "product deleted successfully"));
});

const editProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Get the product ID from request params
  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  // Validate productId format (Optional, but recommended)
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID format");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product is not found");
  }

  const {
    productname,
    price,
    category,
    bestseller,
    description,
    age,
    gender,
    stock,
  } = req.body;
  // Create an object for the fields to be updated
  const updateFields = {};

  // Conditional checking for each field before updating
  if (productname) updateFields.productname = productname;
  if (price) updateFields.price = price;
  if (category) updateFields.category = category;
  if (bestseller !== undefined) updateFields.bestseller = bestseller; // checking for boolean
  if (description) updateFields.description = description;
  if (age) updateFields.age = age;
  if (gender) updateFields.gender = gender;
  if (stock !== undefined) updateFields.stock = stock; // checking for undefined

  // Check if there are fields to update
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId }, // Find the product by ID
    { $set: updateFields }, // Set the fields to update
    { new: true, runValidators: true } // Options: return the updated document, validate the update
  );

  if (!updatedProduct) {
    throw new ApiError(500, "Error while updating the product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  if (!products) {
    throw new ApiError(400, "There are no products");
  }

  return res
    .status(200)
    .send(new ApiResponse(201, products, "All products fetched successfully"));
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const productId = req.query.productId;

  const barcodeNumber = req.query.barcodeNumber;

  if (!productId && !barcodeNumber) {
    throw new ApiError(400, "please enter either barcode number or product id");
  }

  let product;
  if (productId) {
    product = await Product.findById(productId).populate("category");
    if (!product) throw new ApiError(400, "No product is found");
  } else {
    product = await Product.findOne({ barcodeNumber }).populate("category");
    if (!product) throw new ApiError(400, "No product is found");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, product, "product found successfully"));
});

// const getProductByFirm = async (req, res) => {
//   try {
//     const firmId = req.params.firmId;
//     const firm = await Firm.findById(firmId);

//     if (!firm) {
//       return res.status(404).json({ error: "no firm found" });
//     }
//     const brandName = firm.brandName;
//     const products = await Product.find({ firm: firmId });
//     res.status(200).json({ brandName, products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "internal server  error" });
//   }
// };

const deleteAllProducts = asyncHandler(async (req, res) => {
  const deleted = await Product.deleteMany({});

  if (deleted.deletedCount < 1) {
    throw new ApiError(400, "No products are there to delete");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleted.deletedCount,
        "All products deleted successfully"
      )
    );
});

const getProductByQuery = async (req, res) => {
  const { name } = req.query; // Get search query from URL

  if (!name) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    // Find products that start with the query
    const products = await Product.find({
      productname: { $regex: `^${name}`, $options: "i" }, // Case insensitive match
    });

    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------- modified ------

const authDeleteProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Get the product ID from request params
  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  // Validate productId format (Optional, but recommended)
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID format");
  }

  const deletedProduct = await Product.deleteOne({
    _id: productId,
    userId: req.user.userId,
  });
  if (!deletedProduct) {
    throw new ApiError(404, "product deletion failed");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, deletedProduct, "product deleted successfully"));
});

const authEditProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Get the product ID from request params
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // Validate productId format (Optional, but recommended)
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID format");
  }

  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if the user is the owner of the product
  if (product.userId.toString() !== req.user.userId) {
    throw new ApiError(403, "You do not have permission to edit this product");
  }

  const {
    productname,
    price,
    category,
    bestseller,
    description,
    age,
    gender,
    stock,
  } = req.body;

  // Create an object for the fields to be updated
  const updateFields = {};

  // Conditional checking for each field before updating
  if (productname) updateFields.productname = productname;
  if (price) updateFields.price = price;
  if (category) updateFields.category = category;
  if (bestseller !== undefined) updateFields.bestseller = bestseller; // checking for boolean
  if (description) updateFields.description = description;
  if (age) updateFields.age = age;
  if (gender) updateFields.gender = gender;
  if (stock !== undefined) updateFields.stock = stock; // checking for undefined

  // Check if there are fields to update
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId }, // Find the product by ID
    { $set: updateFields }, // Set the fields to update
    { new: true, runValidators: true } // Options: return the updated document, validate the update
  );

  if (!updatedProduct) {
    throw new ApiError(500, "Error while updating the product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

///  only admin and maneger can add products
const authAddProduct = asyncHandler(async (req, res) => {
  const fromReq = req.user;

  console.log(fromReq);
  const user = await AdminManeger.findById(fromReq._id);
  if (!user) {
    throw new ApiError(
      400,
      "To add product, you need to be either admin or manager"
    );
  }

  const {
    productname,
    price,
    category,
    bestseller,
    description,
    age,
    gender,
    stock,
    barcodeNumber,
  } = req.body;

  // console.log(req.body);
  if (
    [
      productname,
      price,
      category,
      bestseller,
      description,
      age,
      gender,
      stock,
      barcodeNumber,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate price, stock, and barcodeNumber for proper data types
  if (isNaN(price) || isNaN(stock) || isNaN(barcodeNumber)) {
    throw new ApiError(
      400,
      "Price, stock, and barcodeNumber should be valid numbers"
    );
  }

  // console.log("req.body:", req.body);
  // console.log("req.files is", req.files);
  const images = req.files?.image;
  // console.log(images)
  let image = [];
  images?.forEach((img) => {
    // console.log(img);
    // console.log(req.protocol, "\n", `${req.get("host")}`);
    const imageUrl = `${req.protocol}://${req.get("host")}/${img.filename}`;

    // console.log(imageUrl);
    image.push(imageUrl);
  });
  // console.log(image);

  if (image.length < 0) {
    throw new ApiError(500, "Error while uploading image");
  }

  const product = await Product.create({
    productname,
    price,
    category,
    bestseller,
    description,
    image,
    age,
    gender,
    stock,
    barcodeNumber,
  });

  const createdProduct = await Product.findById(product._id);

  if (!createdProduct) {
    throw new ApiError(500, "something went wrong while adding the product");
  }
  return res
    .status(200)
    .send(new ApiResponse(201, product, "product added successfully"));
});

export {
  addProduct,
  getAllProducts,
  editProduct,
  deleteProductById,
  getSingleProduct,
  deleteAllProducts,
  getProductByQuery,
  //------------  modified  ---------- add auth
  authAddProduct,
  authDeleteProductById,
  authEditProduct,
};
