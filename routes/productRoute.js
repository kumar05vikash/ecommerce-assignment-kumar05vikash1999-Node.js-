const express = require("express");
const {
  createCategory,
  createSubCategory,
  getCategory,
  getSubCategory,
  getAllProducts,
  createProduct,
  getProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductAllReviews,
  deleteReviews,
} = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
router
  .route("/admin/product/category")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createCategory)
  .get(isAuthenticatedUser, authorizeRoles("admin"), getCategory);

router
.route("/admin/product/sub-category")
.post(isAuthenticatedUser, authorizeRoles("admin"), createSubCategory)
.get(isAuthenticatedUser, authorizeRoles("admin"), getSubCategory);

router.route("/product").get(getAllProducts);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route("/review").get(getProductAllReviews).delete(isAuthenticatedUser,deleteReviews)

module.exports = router;
