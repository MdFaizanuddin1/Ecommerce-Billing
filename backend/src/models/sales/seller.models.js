import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SalesPersonSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure each email is unique
      trim: true,
    },
    phone: {
      type: String,
      required: true, // Ensure each phone number is unique
    },
    hireDate: {
      type: Date,
      default: Date.now, // Default to current date if not provided
    },
    isActive: {
      type: Boolean,
      default: true, // Active by default
    },
    salesTarget: {
      type: Number,
      default: 0, // Default to 0 if not set
    },
    totalSales: {
      type: Number,
      default: 0, // Keep track of total sales made by the salesperson
    },
    totalSalesCount: {
      type: Number,
      default: 0, // Default to 0 sales
    },
    password: {
      type: String,
      required: true,
    },
    bills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
      },
    ], // Array to store bill IDs

    exchangeBillIds: [
      {
        // New field for storing exchange bill IDs
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
      },
    ],

    role: {
      type: String,
      enum: ["salesperson", "manager", "admin"], // Ensure only valid roles
      default: "salesperson", // Default role
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

SalesPersonSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

SalesPersonSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

SalesPersonSchema.methods.incrementTotalSales = async function (amount) {
  this.totalSales += amount; // Add the new amount to totalSales
  // await this.save(); // Save the updated SalesPerson
  return this.totalSales;
};

export const SalesPerson = mongoose.model("SalesPerson", SalesPersonSchema);
