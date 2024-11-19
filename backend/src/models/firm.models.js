import mongoose, { Schema } from "mongoose";

const firmSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
    },
    category: {
      type: [
        {
          type: String,
          enum: ["toys", "apperals", "chepals"],
        },
      ],
    },
    offer: {
      type: String,
    },
    image: {
      type: String,
    },
    vender: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vender",
      },
    ],

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Firm = mongoose.model("Firm", firmSchema);
