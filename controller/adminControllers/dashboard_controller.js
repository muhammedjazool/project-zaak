
const User = require("../../model/userModel")
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")



exports.getDashboard = (req, res) => {
     if (req.session.admin) {
         res.render("dashboard",{title:"Dashboard"})
     } else {
 
         res.redirect("/admin")
     }
 }