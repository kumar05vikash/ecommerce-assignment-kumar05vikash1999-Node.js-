const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: [true, "Please Enter Product Categoty"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("productCategory", productCategorySchema);
