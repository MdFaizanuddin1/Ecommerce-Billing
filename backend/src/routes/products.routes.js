import { Router } from "express";
import {
  addProduct,
  authAddProduct,
  authDeleteProductById,
  authEditProduct,
  deleteAllProducts,
  deleteProductById,
  editProduct,
  getAllProducts,
  getProductByQuery,
  getSingleProduct,
} from "../controllers/products.controllers.js";
import { upload } from "../middlewares/multer.middlrewares.js";
// import { verifyToken } from "../../utils/verifyToken.js";
import { protectAdminManager } from "../middlewares/admin/adminManeger.middleware.js";
import { authSeller } from "../middlewares/sales/seller.middleware.js";

const router = Router();

router
  .route("/addProduct")
  .post(upload.fields([{ name: "image" }]), addProduct);
router.route("/getAllProducts").get(getAllProducts);
router.route("/editProduct/:productId").post(editProduct);
router.route("/delete/:productId").delete(deleteProductById);
router.route("/getSingleProduct").get(getSingleProduct);
router.route("/deleteAllProducts").get(deleteAllProducts);
router.route("/get").get(getAllProducts);
router.route("/get").get(getProductByQuery);

// --------------- auth secured routes

// router
//   .route("/addProducts")
//   .post(upload.fields([{ name: "image" }]), verifyToken, authAddProduct);
// router.route("/delete/:productId").delete(verifyToken, authDeleteProductById);
// router.route("/edit/:productId").patch(verifyToken, authEditProduct);

// only admin and maneger can add
router
  .route("/addProducts")
  .post(
    upload.fields([{ name: "image" }]),
    protectAdminManager,
    authAddProduct
  );

if (authSeller) router.route("/getSingle").get(getSingleProduct);

//
router
  .route("/delete/:productId")
  .delete(protectAdminManager, authDeleteProductById);
router.route("/edit/:productId").patch(protectAdminManager, authEditProduct);
export default router;
