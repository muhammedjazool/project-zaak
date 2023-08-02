const User = require("../model/userModel")

const isLogin = async (req, res, next) => {
 
     try {
         if (!req.session.email) {
             console.log(req.session.email);
             res.redirect("/login");
         } else {
             next();
         }
     } catch (error) {
         console.log(error.message);
     }
 };


 const isLogout = async (req, res, next) => {
     try {
         if (req.session.email) {
             res.redirect("/home");
         } else {
             next();
         }
     } catch (error) {
         console.log(error.message);
     }
 };

 const blockCheck = async (req, res, next) => {
     try {
         if (req.session.email) {
             const userData = req.session.email;
             const id = userData._id;
             const user = await User.findById(id);
 
             if (user.isNotBlocked) {
               
                 res.redirect("/logout");
             } else {
              
                 next();
             }
         } else {
         
             next();
         }
     } catch (error) {
         console.log(error.message);
     }
 };



 

 module.exports = {
     isLogin,
     isLogout,
     blockCheck,
     
 };