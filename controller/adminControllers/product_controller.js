const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const SubCategory = require("../../model/subCategoryModel");
const Banner = require("../../model/bannerModel");
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");

exports.loadProducts = async (req, res) => {
  try {
    const productData = await Product.aggregate([
      { $match: { category: { $exists: true } } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "newCategory",
        },
      },
      {
        $unwind: {
          path: "$newCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $unwind: "$subCategory",
      },
    ]);
    if (req.session.productUpdate) {
      res.render("products", {
        title: "Products",
        productData,
        user: req.session.admin,
      });
      req.session.productUpdate = false;
    }

    if (req.session.products) {
      res.render("products", {
        title: "Products",
        productData,
        productUpdate: "Added successfully",
        user: req.session.admin,
      });
      req.session.products = false;
    } else {
      res.render("products", {
        title: "Products",
        productData,
        user: req.session.admin,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadAddProducts = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const subCategoryData = await SubCategory.find()
    const bannerData = await Banner.find()
    res.render("addProduct", {
      title: "Add Products",
      categoryData,
      subCategoryData,
      bannerData,
      user: req.session.admin,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.verifyAddProducts = async (req, res) => {
  try {
    const { name, price, category, subCategory, offerLabel, offerPrice, description, shortDescription, small, medium, large, xlarge } =
      req.body;

    const images = req.files;
    const uploadedImages = [];

    for (let image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "Products",
      });

      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const sizeArray = [
      {
        small,
        medium,
        large,
        xlarge,
      },
    ];

    let updatedPrice;
    let oldPrice;
    if (offerPrice) {
      updatedPrice = offerPrice;
      oldPrice = price;
    } else {
      updatedPrice = price;
    }
    const newProduct = new Product({
      name,
      price: updatedPrice,
      description: description,
      shortDescription: shortDescription,
      category: category,
      subCategory: subCategory,
      imageUrl: uploadedImages,
      offerlabel: offerLabel,
      oldPrice: oldPrice,
      stock: sizeArray,
      isNew: true,
    });


    await newProduct.save();
    req.session.products = true;
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};

exports.loadEditProducts = async (req, res) => {
  const productId = req.params.id;

  try {
    const productToEdit = await Product.findById(productId);
    const subCategoryData = await SubCategory.find()
    const bannerData = await Banner.find()
    const categories = await Category.find();

    res.render("editProducts", {
      title: "Edit Products",
      categories,
      productToEdit,
      subCategoryData,
      bannerData,
      user: req.session.admin,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateProducts = async (req, res) => {
  try {
    const productId = req.params.id;

    const productToEdit = await Product.findById(productId);

    const existImage = productToEdit.imageUrl;

    const files = req.files;

    let newImages = [];

    for (let file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "Products",
      });

      const Image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      newImages.push(Image);
    }

    const {
      imageCheckbox,
      name,
      price,
      small,
      medium,
      large,
      xlarge,
      category,
      description,
    } = req.body;

    const selectedImages = imageCheckbox.map((index) => existImage[index]);

    productToEdit.imageUrl = selectedImages;
    uploadedImages = [...newImages, ...selectedImages];

    const newSizeArray = [
      {
        small,
        medium,
        large,
        xlarge,
      },
    ];

    await Product.findByIdAndUpdate(
      productId,
      {
        name: name,
        price: price,
        stock: newSizeArray,
        description: description,
        category: category,
        imageUrl: uploadedImages,
      },
      { new: true }
    );
    req.session.productUpdate = true;
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const Id = req.params.id
    const productAvailable = await Product.findById(Id)
    await Product.findByIdAndUpdate(Id, { $set: { available: !productAvailable.available } })

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};


