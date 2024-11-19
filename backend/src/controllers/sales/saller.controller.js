import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { SalesPerson } from "../../models/sales/seller.models.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (seller) => {
  return jwt.sign(
    { id: seller._id, role: seller.role, email: seller.email },
    process.env.JWT_SECRET, // Ensure to set JWT_SECRET in your environment variables
    { expiresIn: "10d" } // Token expiration time
  );
};

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000 * 10, // 1 day
};

const registerSeller = asyncHandler(async (req, res) => {
  const { fullname, email, phone, isActive, password } = req.body;

  // Validate input
  if ([fullname, email, phone, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required to register");
  }

  // Check for existing seller
  const existingSeller = await SalesPerson.findOne({
    $or: [{ email }, { phone }],
  });
  if (existingSeller) {
    throw new ApiError(
      409,
      "A seller with this email or phone number already exists"
    );
  }

  // Create new seller
  const createSalesPerson = await SalesPerson.create({
    fullname,
    email,
    phone,
    password,
    isActive: isActive || true,
  });

  if (!createSalesPerson) {
    throw new ApiError(
      500,
      "Something went wrong while registering the sales person"
    );
  }

  // Immediately select the newly created seller without password
  const createdSalesPerson = await SalesPerson.findById(
    createSalesPerson._id
  ).select("-password");

  const token = generateToken(createSalesPerson);

  return res
    .cookie("seller_token", token, options)
    .status(201) // Use 201 for created resources
    .json(
      new ApiResponse(
        201,
        createdSalesPerson,
        "Sales person registered successfully"
      )
    );
});

const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find the seller by email
  const seller = await SalesPerson.findOne({ email });
  if (!seller) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if the password is correct
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate a JWT token
  const token = generateToken(seller);

  // Exclude the password from the response
  const sellerResponse = { ...seller._doc, token };
  delete sellerResponse.password;

  return res
    .cookie("seller_token", token, options)
    .status(200)
    .json(new ApiResponse(200, sellerResponse, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("seller_token");
  res.status(200).json("seller  has been logged out");
});

const getAllSeller = asyncHandler(async (req, res) => {
  const sellers = await SalesPerson.find();

  if (!sellers) {
    throw new ApiError(400, "No seller is found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, sellers, "sellers found successfully"));
});

const deleteAll = asyncHandler(async (req, res) => {
  const deleteAll = await SalesPerson.deleteMany();
  return res
    .status(200)
    .json(new ApiResponse(200, deleteAll, "deleted all successfully"));
});

export { registerSeller, loginSeller, logout, getAllSeller, deleteAll };
