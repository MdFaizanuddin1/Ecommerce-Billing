import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Category } from "../models/category.models.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory, subCategories } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  // If parentCategory is provided, check if it exists
  if (parentCategory) {
    const existingParentCategory = await Category.findById(parentCategory);
    if (!existingParentCategory) {
      throw new ApiError(400, "Parent category does not exist");
    }
  }

  const newCategory = await Category.create({
    name,
    description,
    parentCategory,
    subCategories,
  });

  if (!newCategory) {
    throw new ApiError(400, "category creation failed");
  }

  return res
    .status(201)
    .send(new ApiResponse(201, newCategory, "Category created successfully"));
});
const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    throw new ApiError(400, "No categories found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "categories fetched successfully"));
});
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(400, "category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, "category fetched successfully"));
});
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(
      400,
      "Invalid status. Status must be 'active' or 'inactive'"
    );
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!updatedCategory) {
    throw new ApiError(404, "Category not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCategory, "category updated successfully")
    );
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .send(
      new ApiResponse(200, deletedCategory, "Category deleted successfully")
    );
});

export {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
