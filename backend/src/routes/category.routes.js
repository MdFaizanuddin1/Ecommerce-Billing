import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
  updateCategory,
} from "../controllers/category.controllers.js";

const router = Router();

router.route("/create").post(createCategory);
router.route("/getAll").get(getAllCategory);
router.route("/get/:id").get(getCategory);
router.route("/update/:id").patch(updateCategory);
router.route("/delete/:id").delete(deleteCategory);

export default router;
