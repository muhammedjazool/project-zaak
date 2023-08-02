const express=require("express")
const user_router= express.Router()
const userController= require("../controller/userControllers/user_controller")
const loginController= require("../controller/userControllers/login_controller")
const signUpController= require("../controller/userControllers/signUp_controller")
const otpController= require("../controller/userControllers/otp_controller")
const productController= require("../controller/userControllers/product_controller")
const profileController= require("../controller/userControllers/profile_controller")
const orderController= require("../controller/userControllers/order_controller")
const cartController= require("../controller/userControllers/cart_controller")
const auth = require("../middleware/userAuth");


const { isLogin, isLogout, blockCheck,} = auth

////////////user get////////////

user_router.get("/",userController.homePage)
user_router.get("/home",isLogin,blockCheck, userController.homeLoad)
user_router.get("/profile",isLogin,blockCheck, profileController.loadProfile)
user_router.post("/verifyProfile",profileController.verifyProfile)

user_router.post('/addNewAddress', userController.addNewAddress)
user_router.get("/deleteAddress", userController.deleteAddress);


user_router.get("/login",isLogout,loginController.loginGet)
user_router.post("/signup",signUpController.signUpPost)
user_router.post("/login",loginController.loginPost)
user_router.get("/logout",userController.logout)


user_router.get("/forgotPassword",isLogout,loginController.forgotPassword)
user_router.post("/verifyEmail",isLogout,loginController.verifyForgotEmail)
user_router.get("/forgotPasswordOtp",isLogout,loginController.forgotPasswordOtp)
user_router.post("/verifyForgotPasswordOtp",isLogout,loginController.verifyForgotPasswordOtp)
user_router.get("/resetPassword",isLogout,loginController.loadResetPassword)
user_router.post("/resetPassword",isLogout,loginController.verifyResetPassword)


user_router.get("/products",blockCheck,productController.products)
user_router.get("/productView",productController.loadProductView)

user_router.get("/cart",isLogin, blockCheck,cartController.loadCart)
user_router.post("/addToCart",cartController.addToCart)
user_router.post('/cartUpdation',cartController.updateCart)
user_router.get("/removeFromCart",cartController.removeFromCart)
user_router.get("/checkOut", isLogin, blockCheck,cartController.loadCheckOut)


user_router.post("/placeOrder",orderController.placeOrder)
// user_router.get("/orderSuccess",orderController.orderSuccess)

user_router.get("/otp",isLogout,otpController.otpGet)
user_router.post("/otpEnter",isLogout,otpController.otpVerify)


user_router.get("/wishlist",userController.wishlistLoad)







module.exports =user_router