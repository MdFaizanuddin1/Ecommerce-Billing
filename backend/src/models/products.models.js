import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    productname: {
      type: String,
      required: true,
    },

    barcodeNumber: {
      type: String,
      required: true,
      unique: true, // Optional, but useful for ensuring uniqueness
    },
    price: {
      type: Number,
      required: true,
    },
    // category: [
    //   {
    //     type: String,
    //     enum: ["toys", "apperals", "chepals"],
    //   },
    // ],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    bestseller: {
      type: Boolean,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,

      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },

    //
    restockedAt: {
      // Track when the product was last restocked
      type: Date,
    },
    lowStockThreshold: {
      // Alert if stock goes below a certain threshold
      type: Number,
      default: 10,
    },
    stockHistory: [
      // Historical records of stock changes
      {
        type: new Schema(
          {
            quantityChanged: { type: Number, required: true }, // + or - stock change
            changeReason: { type: String, required: true }, // Restock or Sold
            date: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      },
    ],
    //

    firm: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Firm",
      },
    ],
    userId: {
      //owmer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", ProductSchema);
