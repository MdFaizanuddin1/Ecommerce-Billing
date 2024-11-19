import mongoose, { Schema } from "mongoose";

// Defining the Category schema
const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Self-reference for nested categories
      default: null,
    },
    subCategories: [
      {
        name: {
          type: String,
          required: [true, "Subcategory name is required"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model
export const Category = mongoose.model("Category", CategorySchema);
