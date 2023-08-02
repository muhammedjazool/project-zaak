const User = require("../../model/userModel")
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")

const credential = {
    email: "jazoolzax1234@gmail.com",
    password: "12"
}


exports.adminLogin = (req, res) => {
    if (req.session.admin) {
        res.redirect("/admin/dashboard")
    } else {
        res.render("adminLogin", { title: "Admin Login" })
    }
}

exports.verifyLogin = (req, res) => {
    if (req.body.email === credential.email && req.body.password === credential.password) {
        req.session.admin = req.body.email;
        res.redirect('/admin/dashboard')
    } else {
        return res.render("adminLogin", { error: "Invalid Username or Password!" })
    }
};

exports.logoutAdmin = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
}


