const Category = require("../../model/categoryModel")
const User = require("../../model/userModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")



// exports.loadCart=async(req,res)=>{
// const userData=req.session.user;
// const userId= req.query.id;

// const categoryData=await Category.find({isBlocke:true})
// const user= await User.findOne({_id:userId}).populate("cart.product").lean()
// const cart=user.cart;
//      res.render("cart" , {title:"Cart"})
// }
