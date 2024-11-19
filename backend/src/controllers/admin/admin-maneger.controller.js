import { asyncHandler } from "../../../utils/asyncHandler.js";
import { AdminManeger } from "../../models/admin/admin-maneger.models.js";
import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import jwt from "jsonwebtoken";

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

// Admin/Manager Signup
const signup = asyncHandler(async (req, res) => {
  const { fullname, email, password, role } = req.body;

  // Validate request
  if (!fullname || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await AdminManeger.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const newUser = await AdminManeger.create({
    fullname,
    email,
    password,
    role: role || "Manager", // Default to Manager role
  });

  const token = generateToken(newUser);

  const userWithoutPassword = await AdminManeger.findById(newUser._id).select(
    "-password"
  );

  res
    .cookie("admin_manger_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .status(201)
    .json(
      new ApiResponse(
        201,
        userWithoutPassword,
        "Admin/Manager registered successfully"
      )
    );
});

// Admin/Manager Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await AdminManeger.findOne({ email });
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);

  res
    .cookie("admin_manger_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .status(200)
    .json(new ApiResponse(200, { token, user }, "Logged in successfully"));
});

// Get current Admin/Manager profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await AdminManeger.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("admin_manger_token");
  res.status(200).json("User has been logged out");
});

const getAll = asyncHandler(async (req, res) => {
  const all = await AdminManeger.find();
  if (!all) {
    throw new ApiError(400, "No maneger-admin is found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, all, "All manegers / admis found"));
});

export { signup, login, logout, getProfile, getAll };
