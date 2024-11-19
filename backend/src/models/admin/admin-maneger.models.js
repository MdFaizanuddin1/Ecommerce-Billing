import mongoose from "mongoose";
import bcrypt from "bcrypt";

// User Schema for Admin/Manager
const adminManegerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Manager"], // Only Admin or Manager
      default: "Manager", // Default to Manager
    },
    isActive: {
      type: Boolean,
      default: true, // Active by default
    },
    // bills: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Bill",
    //   },
    // ], // Array to store bill IDs
    // totalSales: {
    //   type: Number,
    //   default: 0, // Keep track of total sales made by the salesperson
    // },
    // totalSalesCount: {
    //   type: Number,
    //   default: 0, // Default to 0 sales
    // },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminManegerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
adminManegerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const AdminManeger = mongoose.model("AdminManeger", adminManegerSchema);
