{
  // import { asyncHandler } from "../../utils/asyncHandler.js";
  // import { ApiError } from "../../utils/apiError.js";
  // import { ApiResponse } from "../../utils/apiResponse.js";
  // import { User } from "../models/user.models.js";
  // //
  // import bcrypt from "bcryptjs";
  // import jwt from "jsonwebtoken";
  // //
  // import doten from "dotenv";
  // doten.config();
  // const registerUser = asyncHandler(async (req, res) => {
  //   const { username, email, password, role } = req.body;
  //   // const {fullName} = req.body
  //   // console.log(username, email, fullName, password, role);
  //   if (
  //     // check for full name
  //     [email, username, password, role].some((field) => field?.trim() === "")
  //   ) {
  //     throw new ApiError(400, "All fields are required");
  //   }
  //   const existedUser = await User.findOne({
  //     $or: [{ username }, { email }],
  //   });
  //   if (existedUser) {
  //     throw new ApiError(409, "User with email or username already exists");
  //   }
  //   // doB
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const user = await User.create({
  //     username,
  //     email,
  //     // fullName,
  //     role,
  //     password: hashedPassword,
  //   });
  //   const createdUser = await User.findById(user._id);
  //   if (!createdUser) {
  //     throw new ApiError(500, "something went wrong while registering user");
  //   }
  //   return res
  //     .status(201)
  //     .json(new ApiResponse(200, createdUser, "User registered successfully"));
  //   //
  // });
  // const Key_Secret = process.env.Key_Secret;
  // // console.log("secret key is ", Key_Secret);
  // const longinUser = asyncHandler(async (req, res) => {
  //   const { email, password } = req.body;
  //   if (!email) {
  //     throw new ApiError(400, "email is required");
  //   }
  //   const user = await User.findOne({ email });
  //   if (!user) {
  //     throw new ApiError(404, "User does not exists");
  //   }
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new ApiError(401, "Invalid password or user credintials");
  //   }
  //   const token = jwt.sign({ userId: user._id }, Key_Secret, {
  //     expiresIn: "10d",
  //   });
  //   const loggedInUser = await User.findById(user._id);
  //   const roleOfUser = loggedInUser.role;
  //   return res
  //     .status(200)
  //     .cookie("access_token", token, {
  //       httpOnly: true,
  //     })
  //     .json(
  //       new ApiResponse(
  //         200,
  //         {
  //           user: loggedInUser,
  //           role: roleOfUser,
  //           token,
  //         },
  //         "user logged in successfully"
  //       )
  //     );
  // });
  // const getAllUsers = asyncHandler(async (req, res) => {
  //   // need to modify
  //   const users = await User.find();
  //   if (!users) {
  //     throw new ApiResponse(400, "No users found");
  //   }
  //   res
  //     .status(200)
  //     .send(new ApiResponse(201, users, "users fetched successfully"));
  // });
  // const changeCurrentPassword = asyncHandler(async (req, res) => {
  //   const { newPassword } = req.body;
  //   // const { oldPassword, newPassword } = req.body;
  //   const { userId } = req.params;
  //   const user = await User.findById(userId);
  //   if (!user) {
  //     throw new ApiError(404, "User not found");
  //   }
  //   // const checkIfOldPasswordValid = await bcrypt.compare(
  //   //   oldPassword,
  //   //   user.password
  //   // );
  //   // if (!checkIfOldPasswordValid) {
  //   //   throw new ApiError(404, "old password does not match");
  //   // }
  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   user.password = hashedPassword;
  //   await user.save();
  //   return res
  //     .status(200)
  //     .send(new ApiResponse(201, user, "password changed successfully"));
  // });
  // const changePass = asyncHandler(async (req, res) => {
  //   const { userId } = req.params;
  //   const user = await User.findById(req.user.userId);
  //   if (!user) {
  //     throw new ApiError(400, "user not found");
  //   }
  //   // console.log(user);
  //   // console.log('params', userId);
  //   // console.log(req.user.userId);
  //   if (req.user.userId !== userId) {
  //     throw new ApiError(400, "you can only update you own password");
  //   }
  //   //
  //   const { newPassword, oldPassword } = req.body;
  //   const checkIfOldPasswordValid = await bcrypt.compare(
  //     oldPassword,
  //     user.password
  //   );
  //   if (!checkIfOldPasswordValid) {
  //     throw new ApiError(404, "old password does not match");
  //   }
  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   user.password = hashedPassword;
  //   await user.save();
  //   const { password, ...userWithoutPassword } = user.toObject();
  //   return res
  //     .status(200)
  //     .send(
  //       new ApiResponse(201, userWithoutPassword, "password changed successfully")
  //     );
  // });
  // const logOut = asyncHandler(async (req, res) => {
  //   res.clearCookie("access_token");
  //   res.status(200).json("User has been logged out");
  // });
  // export {
  //   registerUser,
  //   longinUser,
  //   getAllUsers,
  //   changeCurrentPassword,
  //   // -------- secure auth
  //   logOut,
  //   changePass,
  // };
}
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { User } from "../models/user.models.js";
//
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//

import dotenv from "dotenv";
dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET, // Ensure to set JWT_SECRET in your environment variables
    { expiresIn: "10d" } // Token expiration time
  );
};

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000 * 10, // 10day
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  // const {fullName} = req.body
  // console.log(username, email, fullName, password, role);

  if (
    // check for full name
    [email, username, password, role].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // doB
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    // fullName,
    role,
    password: hashedPassword,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  const token = generateToken(createdUser);

  return res
    .cookie("access_token", token, options)
    .status(201)
    .json(
      new ApiResponse(
        200,
        { createdUser, token },
        "User registered successfully"
      )
    );

  //
});

const Key_Secret = process.env.Key_Secret;
// console.log("secret key is ", Key_Secret);

const logInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password or user credentials");
  }

  // const token = jwt.sign({ userId: user._id }, Key_Secret, {
  //   expiresIn: "10d",
  // });

  const loggedInUser = await User.findById(user._id).select("-password");
  const token = generateToken(loggedInUser);
  const roleOfUser = loggedInUser.role;

  return res
    .status(200)
    .cookie("access_token", token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          role: roleOfUser,
          token,
        },
        "user logged in successfully"
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  // need to modify
  const users = await User.find();
  if (!users) {
    throw new ApiResponse(400, "No users found");
  }
  res
    .status(200)
    .send(new ApiResponse(201, users, "users fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  // const { oldPassword, newPassword } = req.body;
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // const checkIfOldPasswordValid = await bcrypt.compare(
  //   oldPassword,
  //   user.password
  // );
  // if (!checkIfOldPasswordValid) {
  //   throw new ApiError(404, "old password does not match");
  // }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  return res
    .status(200)
    .send(new ApiResponse(201, user, "password changed successfully"));
});

const changePass = asyncHandler(async (req, res) => {
  // const { userId } = req.params;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "user not found");
  }
  // console.log(userId);
  // console.log(user._id);
  if (user._id.toString() != userId) {
    throw new ApiError(404, "you can only update you own password");
  }

  //

  const { newPassword, oldPassword } = req.body;
  const checkIfOldPasswordValid = await bcrypt.compare(
    oldPassword,
    user.password
  );
  if (!checkIfOldPasswordValid) {
    throw new ApiError(404, "old password does not match");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  const { password, ...userWithoutPassword } = user.toObject();
  return res
    .status(200)
    .send(
      new ApiResponse(201, userWithoutPassword, "password changed successfully")
    );
});

const logOut = asyncHandler(async (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json("User has been logged out");
});

const getUser = asyncHandler(async (req, res) => {
  // console.log("got called");
  const userFromReq = req.user;
  const user = await User.findById(userFromReq._id).select("-password");

  if (!user) {
    throw new ApiError(404, "you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

export {
  registerUser,
  logInUser,
  getAllUsers,
  changeCurrentPassword,
  // -------- secure auth
  getUser,
  logOut,
  changePass,
};
