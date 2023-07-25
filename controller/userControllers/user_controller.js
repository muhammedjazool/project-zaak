const User = require("../../model/userModel")


exports.homePage = async (req, res) => {
  try {
    const userDetail = await User.findOne({ email: req.session.email })
    if (userDetail) {
      res.render("home", { userDetail })
    }
    else {
      res.render("home")
    }
  } catch (error) {
    error.message
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



















