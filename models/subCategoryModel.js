const mongoose = require("mongoose");

const productSubCategorySchema = new mongoose.Schema({
  productSubCategory: {
    type: String,
    required: [true, "Please Enter Product Categoty"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productCategory",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("productSubCategory", productSubCategorySchema);
