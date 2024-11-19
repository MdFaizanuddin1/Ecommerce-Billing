import mongoose, { Schema } from "mongoose";

const VendorSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firm: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Firm",
      },
    ],
    aadhaar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aadhaar",
    },
    pan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pan",
    },

    capturePersonImage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CapturePersonImage",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Vendor = mongoose.model("Vendor", VendorSchema);
