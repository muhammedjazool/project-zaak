    const Category = require("../../model/categoryModel")
const User = require("../../model/userModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")


exports.homePage = async (req, res) => {
  try {
    const categoryData= await Category.find({isBlocked:true})
     const userDetail = await User.findOne({ email: req.session.email })
   
    if (userDetail) {
      res.render("home", { userDetail ,categoryData})
    }
    else {
      res.render("home",{categoryData})
    }
  } catch (error) {
    console.log(error)
    res.render("404")
  }
}


exports.logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
}
















exports.homeLoad = async (req, res) => {

}



////////////////WISHLIST//////////////
exports.wishlistLoad = (req, res) => {
  res.render("wishlist")
}



















