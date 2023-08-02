const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const cloudinary = require("../../config/cloudinary");

exports.products = async (req, res) => {
  const categoryData = await Category.find({ isNotBlocked: true });
  const userDetail = req.session.email;

  try {
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 6;

    const id = req.query.id;
    let productData;
    let totalCount;

    const isCategory = await Category.exists({ _id: id });

    if (isCategory) {
      productData = await Product.find({ category: id, available: true })
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
      totalCount = await Product.countDocuments({
        category: id,
        available: true,
      });
    }
    const totalPages = Math.ceil(totalCount / productsPerPage);

    if (userDetail) {
      res.render("userProducts", {
        title: "Products",
        categoryData,

        userDetail,
        productData,
        currentPage: page,
        totalPages,
      });
    } else {
      res.render("userProducts", {
        title: "Products",
        categoryData,
        productData,
        currentPage: page,
        totalPages,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.loadProductView = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await Product.findById(productId);
    const categoryData = await Category.find({ isNotBlocked: true });
    const userDetail = req.session.email;

    if (userDetail) {
      if (!productData) {
        res.render("404", { userDetail, categoryData });
      } else {
        res.render("productView", {
          title: "Product View",
          productData,
          categoryData,
          userDetail,
        });
      }
    } else {
      if (!productData) {
        res.render("404", { categoryData });
      } else {
        res.render("productView", {
          title: "Product View",
          productData,
          categoryData,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    const userData = req.session.email;
    const categoryData = await Category.find({ is_blocked: false });
    res.render("404", { userData, categoryData });
  }
};
