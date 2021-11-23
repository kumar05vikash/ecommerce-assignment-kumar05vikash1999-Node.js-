const Product = require("../models/productModel");
const ProductCategory = require("../models/categoryModel");
const ProductSubCategory = require("../models/subCategoryModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

// Create Product Category. (Admin)
exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const category = await ProductCategory.create(req.body);
  delete category._doc.createdAt;
  delete category._doc.__v;
  res.status(201).json({
    code: 201,
    sucess: true,
    category,
  });
});

// Create Product Sub-Category. (Admin)
exports.createSubCategory = catchAsyncErrors(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const subCategory = await ProductSubCategory.create(req.body);
  delete subCategory._doc.createdAt;
  delete subCategory._doc.__v;
  delete subCategory._doc.productCategory;
  res.status(201).json({
    code: 201,
    sucess: true,
    subCategory,
  });
});

// Create Product.       (Admin)
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const product = await Product.create(req.body);
  delete product._doc.__v;
  res.status(201).json({
    code: 201,
    sucess: true,
    product,
  });
});

// Get All Product Category.       (Admin)
exports.getCategory = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await ProductCategory.countDocuments();
  let apiFeature = new ApiFeatures(ProductCategory.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const productsCategory = await apiFeature.query;
  res.status(200).json({
    code: 200,
    sucess: true,
    productCount,
    productsCategory,
  });
});

// Get All Product Sub-Category.       (Admin)
exports.getSubCategory = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await ProductSubCategory.countDocuments();
  let apiFeature = new ApiFeatures(ProductSubCategory.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const productsCategory = await apiFeature.query;
  res.status(200).json({
    code: 200,
    sucess: true,
    productCount,
    productsCategory,
  });
});

// Get All Product.
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  let apiFeature = new ApiFeatures(
    Product.find()
      .populate({
        path: "productSubCategory",
        model: "productSubCategory",
        select: {
          _id: 0,
          productSubCategory: 1,
          productCategory: 1,
          createdBy: 1,
        },
        populate: {
          path: "productCategory",
          model: "productCategory",
          select: { _id: 0, productCategory: 1 },
        },
      })
      .populate({
        path: "createdBy",
        model: "User",
        select: { _id: 0, name: 1, email: 1 },
      }),
    req.query
  )
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  res.status(200).json({
    code: 200,
    sucess: true,
    productCount,
    products,
  });
});

// Product Details.
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found..!", 404));
  }
  return res.status(200).json({
    code: 200,
    sucess: true,
    product,
  });
});
// Update Product.        (Admin)
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found..!", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res.status(200).json({
    code: 200,
    sucess: true,
    product,
  });
});

// Delete Product.        (Admin)
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found..!", 404));
  }

  await product.remove();
  return res.status(200).json({
    sucess: true,
    message: "Product Deleted..!",
  });
});

// Create new Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let ratingAverage = 0;

  product.reviews.forEach((rev) => {
    return (ratingAverage += rev.rating);
  });
  product.ratings = ratingAverage / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    sucess: true,
  });
});

// Get All Reviews of a product
exports.getProductAllReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found..!", 404));
  }

  return res.status(200).json({
    sucess: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found..!", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let ratingAverage = 0;

  reviews.forEach((rev) => {
    ratingAverage += rev.rating;
  });
  const ratings = ratingAverage / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  return res.status(200).json({
    sucess: true,
  });
});
