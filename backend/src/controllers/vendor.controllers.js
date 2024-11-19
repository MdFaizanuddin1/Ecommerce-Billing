import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

import { Vendor } from "../models/vendor.models.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const SecretKey = process.env.whatIsYourCompany;

const vendorRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation: Check for missing fields
  if ([name, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  // Check if vendor with the same email already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    throw new ApiError(409, "Email is already registered"); // 409 Conflict
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newVendor = await Vendor.create({
    username: name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { id: newVendor._id, email: newVendor.email },
    SecretKey,
    { expiresIn: "10d" }
  );

  const createdVendor = await Vendor.findById(newVendor._id);

  if (!createdVendor) {
    throw new ApiError(500, "Error while creating the vendor");
  }

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        { createdVendor, token },
        "Vendor registered successfully"
      )
    );
});

const vendorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate that email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find vendor by email
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, vendor.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: vendor._id, email: vendor.email }, SecretKey, {
    expiresIn: "10d", // Token will expire in 1 hour
  });

  // Respond with token and vendor data
  return res.status(200).send(
    new ApiResponse(
      200,
      {
        token,
        vendor: {
          id: vendor._id,
          username: vendor.username,
          email: vendor.email,
        },
      },
      "Login successful"
    )
  );
});
const changePassword = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Validate that current password and new password are provided
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "NO vendor was found");
  }

  // Check if the current password is correct
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    vendor.password
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update the vendor's password
  vendor.password = hashedNewPassword;
  await vendor.save();

  return res
    .status(200)
    .send(new ApiResponse(200, vendor, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "NO vendor was found");
  }

  const updateFields = {};
  if (email) updateFields.email = email;
  if (username) updateFields.username = username;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedProfile = await Vendor.findByIdAndUpdate(
    { _id: vendorId }, // Filter to match the vendor by ID
    { $set: updateFields }, // Update object
    { new: true } // Option to return the updated document (useful in findByIdAndUpdate)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "updated vendor profile successfully"
      )
    );
});

const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find();

  if (!vendors) {
    throw new ApiError(404, "No vendors was found");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, vendors, "All vendors fetched successfully"));
});

const getSingleVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "NO vendor was found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor fetched successfully"));
});

//---- auth

const authvendorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate that email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find vendor by email
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, vendor.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: vendor._id, email: vendor.email }, SecretKey, {
    expiresIn: "2h", // Token will expire in 1 hour
  });

  // Respond with token and vendor data
  return res
    .status(200)
    .cookie("vendor_token", token, {
      httpOnly: true,
    })
    .send(
      new ApiResponse(
        200,
        {
          token,
          vendor: {
            id: vendor._id,
            username: vendor.username,
            email: vendor.email,
          },
        },
        "Login successful"
      )
    );
});

const authchangePassword = asyncHandler(async (req, res) => {
  // const { vendorId } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Validate that current password and new password are provided
  // console.log("id is", req.vendor._id);

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    throw new ApiError(404, "NO vendor was found");
  }

  // Check if the current password is correct
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    vendor.password
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update the vendor's password
  vendor.password = hashedNewPassword;
  await vendor.save();

  return res
    .status(200)
    .send(new ApiResponse(200, vendor, "Password changed successfully"));
});

const logOut = asyncHandler(async (req, res) => {
  res.clearCookie("vendor_token");
  res.status(200).json("vendor has been logged out");
});

const authUpdateProfile = asyncHandler(async (req, res) => {
  const { email, username } = req.body;

  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    throw new ApiError(404, "you are not authorised");
  }

  const updateFields = {};
  if (email) updateFields.email = email;
  if (username) updateFields.username = username;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedProfile = await Vendor.findByIdAndUpdate(
    { _id: vendor._id }, // Filter to match the vendor by ID
    { $set: updateFields }, // Update object
    { new: true } // Option to return the updated document (useful in findByIdAndUpdate)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "updated vendor profile successfully"
      )
    );
});

export {
  vendorRegister,
  vendorLogin,
  changePassword,
  updateProfile,
  getAllVendors,
  getSingleVendor,

  // ---- auth
  authvendorLogin,
  authchangePassword,
  logOut,
  authUpdateProfile,
};
