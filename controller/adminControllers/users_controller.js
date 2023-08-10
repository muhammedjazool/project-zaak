const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const cloudinary = require("../../config/cloudinary");

exports.getUser = async (req, res) => {
  try {
    const users = await User.find();
    res.render("users", { title: "Users", users: users });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadBlockOrUnblock = async (req, res) => {
  try {
    const Id = req.params.userId;
    const blocked = await User.findById(Id);
    await User.findByIdAndUpdate(Id, {
      $set: { isNotBlocked: !blocked.isNotBlocked },
    });
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error);
  }
};
