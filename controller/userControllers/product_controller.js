const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const SubCategory = require("../../model/subCategoryModel");
const cloudinary = require("../../config/cloudinary");
const { ISO_8601 } = require("moment");

exports.products = async (req, res) => {
  const categoryData = await Category.find({ isNotBlocked: true });
  const userDetail = req.session.email;

 

  try {
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 5;

    const id = req.query.id;
    const selectedSubCategories = req.query.subcategories ? req.query.subcategories.split(',') : [];
    let productData;
    let totalCount;
    let subCategoryData = [];


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


    subCategoryData = await SubCategory.find({ categoryId: id });

    const productCounts = await Promise.all(
      subCategoryData.map(async (subCategory) => {
        const count = await Product.countDocuments({ subCategory: subCategory._id });
        return { subCategoryId: subCategory._id, count };
      })
    );

    subCategoryData.forEach((subCategory) => {
      const countData = productCounts.find(item => item.subCategoryId.toString() === subCategory._id.toString());
      subCategory.productCount = countData ? countData.count : 0;
    });


    const totalPages = Math.ceil(totalCount / productsPerPage);




    if (userDetail) {
      res.render("userProducts", {
        title: "Products",
        categoryData,
        subCategoryData,
        userDetail,
        productData,
        currentPage: page,
        totalPages,
        id: id,
        category: isCategory,
      });
    } else {
      res.render("userProducts", {
        title: "Products",
        categoryData,
        subCategoryData,
        productData,
        currentPage: page,
        totalPages,
        id: id,
        category: isCategory,
      });
    }
  } catch (error) {
    console.log(error);
  }
};


exports.allProducts = async (req, res) => {
  const categoryData = await Category.find({ isNotBlocked: true });
  const categoryFilterData = await Category.find({ isNotBlocked: true });

  const subCategoryData = await SubCategory.find();

  try {
    const page = parseInt(req.query.allProductsPage) || 1;
    const productsPerPage = 5;

    categoryFilterData.forEach(async (category, index) => {
      const productCount = await Product.countDocuments({ category: category._id });
      categoryFilterData[index].productCount = productCount;
    });

    subCategoryData.forEach(async (subCategory, index) => {
      const productCount = await Product.countDocuments({ subCategory: subCategory._id });
      subCategoryData[index].productCount = productCount;
    });


    let productData;

    const search = req.query.search;

    if (search) {
      productData = await Product.find({
        name: { $regex: ".*" + search + ".*", $options: "i" },
      })
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
    } else {
      productData = await Product.find()
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
    }

    const totalCount = search
      ? await Product.countDocuments({ name: { $regex: ".*" + search + ".*", $options: "i" } })
      : await Product.countDocuments();

    const totalPages = Math.ceil(totalCount / productsPerPage);

    let noProductsFound = false;
    if (search && productData.length === 0) {
      noProductsFound = true;
    }


    if (req.session.email) {
      const userDetail = req.session.email;
      res.render("allProducts", {
        title: "All Products",
        userDetail,
        productData,
        categoryData,
        categoryFilterData,
        subCategoryData,
        currentPage: page,
        totalPages,
        noProductsFound,
      });
    } else {
      res.render("allProducts", {
        title: "All Products",
        productData,
        categoryData,
        categoryFilterData,
        subCategoryData,
        currentPage: page,
        totalPages,
        noProductsFound,
      });
    }
  } catch (error) {
    console.log(error.message);
    const userData = req.session.user;
    res.render("404", { userData, categoryData });
  }
};




exports.loadProductView = async (req, res) => {
  try {
    const productId = req.query.id;

    const productData = await Product.findById(productId);

    const categoryData = await Category.find({ isNotBlocked: true });

    const subCategoryData = await SubCategory.find({ is_blocked: false });

    const category = await Product.findById({ _id: productId }).populate("category").lean();
    const categoryName = category.category;

    const subCategory = await Product.findById({ _id: productId }).populate("subCategory").lean();
    const subCategoryName = subCategory.subCategory;

    if (req.session.email) {

      const userDetail = req.session.email;

      const userId = userDetail._id;


      if (!productData) {

        res.render("404", { userDetail, categoryData });
      } else {
        res.render("productView", {
          title: "Product View",
          productData,
          categoryData,
          userDetail,
          subCategoryData,
          categoryName,
          subCategoryName,
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
          categoryName,
          subCategoryName,


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

exports.categoryFilter = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;

    const productData = await Product.find({ category: categoryId });
    res.json(productData);
  } catch (error) {
    console.log(error.message);
  }
};

exports.subCategoryFilter = async (req, res) => {
  try {
    const subCategoryId = req.query.subCategoryId

    const productData = await Product.find({ subCategory: subCategoryId });

    res.json(productData)
  } catch (error) {

  }
}

exports.originalProductData = (req, res) => {
  res.redirect("/products")
}



exports.offerProducts = async (req, res) => {

  const categoryData = await Category.find({ isNotBlocked: true });
  const subCategoryData = await SubCategory.find();

  try {
    const page = parseInt(req.query.offerPage) || 1;
    const productsPerPage = 6;

    subCategoryData.forEach(async (subCategory, index) => {
      const productCount = await Product.countDocuments({ subCategory: subCategory._id });
      subCategoryData[index].productCount = productCount;
    });



    const offerlabel = req.query.label;

    const productData = await Product.find({ offerlabel: { $in: offerlabel } })
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    const totalCount = await Product.countDocuments({ offerlabel: { $in: offerlabel } });

    const totalPages = Math.ceil(totalCount / productsPerPage);

    const userDetail = req.session.email;
    if (userDetail) {
      res.render("offerProducts", {
        title: "Offer Products",
        productData,
        categoryData,
        userDetail,
        subCategoryData,
        currentPage: page,
        totalPages,
        offerHeading: `${offerlabel} offer`,
      });
    } else {
      res.render("offerProducts", {
        title: "Offer Products",
        productData,
        categoryData,
        subCategoryData,
        currentPage: page,
        totalPages,
        offerHeading: `${offerlabel} offer`,
      });
    }
  } catch (error) {
    console.log(error.message);
    const userData = req.session.user;
    res.render("404", { userData, categoryData });
  }
};



exports.sortProduct = async (req, res) => {

  try {
    const sort = req.body.sort;
    const categoryId = req.body.categoryId;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const productData = await Product.find({ category: categoryId }).sort({ price: sort });

    res.json(productData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







