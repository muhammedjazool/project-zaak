const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const cloudinary = require("../../config/cloudinary");

exports.loadCategory = async (req, res) => {
  try {
    const categoryData = await Category.find();
    let catUpdated = "";
    let catNoUpdation = '';
    if (req.session.categoryUpdate) {
      res.render("category", {
        title: "Category",
        categoryData,
        catUpdated: "Category updated successfully",
        user: req.session.admin,
      });
      req.session.categoryUpdate = false;
    } else if (req.session.categorySave) {
      res.render("category", {
        title: "Category",
        categoryData,
        catUpdated: "Category Added successfully",
        user: req.session.admin,
      });
      req.session.categorySave = false;
    } else if (req.session.categoryExist) {
      res.render("category", {
        title: "Category",
        categoryData,
        catNoUpdation: "Category Already Exists!!",
        user: req.session.admin,
      });
      req.session.categoryExist = false;
    } else {
      res.render("category", {
        title: "Category",
        categoryData,
        catUpdated,
        catNoUpdation,
        user: req.session.admin
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};



exports.addCategory = (req, res) => {
  try {
    res.render("addCategory", { title: "Add Category", user: req.session.admin });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};



exports.addNewCategory = async (req, res) => {
  const image = req.file;
  const categoryName = req.body.name;
  const categoryDescription = req.body.categoryDescription;
  const lowerCategoryName = categoryName.toLowerCase();


  try {
    const result = await cloudinary.uploader.upload(image.path, {
      folder: "Categories",
    });

    const categoryExist = await Category.findOne({
      category: lowerCategoryName,

    });







    if (!categoryExist) {
      const newCategory = new Category({
        imageUrl: {
          public_id: result.public_id,
          url: result.secure_url,
        },
        category: lowerCategoryName,
        description: categoryDescription,
        isNotBlocked: false,
      });






      await newCategory.save();
      req.session.categorySave = true;

      res.redirect("/admin/categories");
    } else {




      req.session.categoryExist = true;
      res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};



exports.editCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const categoryData = await Category.findById({ _id: categoryId });
    res.render("editCategory", { title: "Edit category", categoryData, user: req.session.admin });
  } catch (error) {
    console.log(error.message);
  }
};




exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryName = req.body.name;
    const categoryDescription = req.body.categoryDescription;
    const newImage = req.file;

    const categoryData = await Category.findById(categoryId);
    const categoryImageUrl = categoryData.imageUrl.url;

    let result;

    if (newImage) {
      if (categoryImageUrl) {
        await cloudinary.uploader.destroy(categoryData.imageUrl.public_id);
      }

      result = await cloudinary.uploader.upload(newImage.path, {
        folder: "Categories",
      });
    } else {
      result = {
        public_id: categoryData.imageUrl.public_id,
        secure_url: categoryImageUrl,
      };
    }

    const catExist = await Category.findOne({ category: categoryName });
    const imageExist = await Category.findOne({
      "imageUrl.url": result.secure_url,
    });
    const descriptionExist = await Category.findOne({ description: categoryDescription })
    if (!catExist || !imageExist || !descriptionExist) {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          category: categoryName,
          imageUrl: {
            public_id: result.public_id,
            url: result.secure_url,
          },
          description: categoryDescription,
        },
        { new: true }
      );
      req.session.categoryUpdate = true;
      res.redirect("/admin/categories");
    } else {
      req.session.categoryExist = true;
      res.redirect("/admin/editCategory/:id");
    }
  } catch (error) {
    console.log(error.message);
  }
};


exports.unListCategory = async (req, res) => {
  const Id = req.params.categoryDataId
  const unList = await Category.findById(Id)

  await Category.findByIdAndUpdate(Id, { $set: { isNotBlocked: !unList.isNotBlocked } })
  res.redirect("/admin/categories")
}