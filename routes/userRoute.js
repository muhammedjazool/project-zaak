const express = require("express")
const user_router = express.Router()
const userController = require("../controller/userControllers/user_controller")
const loginController = require("../controller/userControllers/login_controller")
const signUpController = require("../controller/userControllers/signUp_controller")
const otpController = require("../controller/userControllers/otp_controller")
const productController = require("../controller/userControllers/product_controller")
const profileController = require("../controller/userControllers/profile_controller")
const orderController = require("../controller/userControllers/order_controller")
const cartController = require("../controller/userControllers/cart_controller")
const auth = require("../middleware/userAuth");


const { isLogin, isLogout, blockCheck, isCheckout } = auth

////////////user get////////////

user_router.get("/", userController.homePage)

user_router.get("/profile", isLogin, blockCheck, profileController.loadProfile)
user_router.post("/verifyProfile", profileController.verifyProfile)

user_router.get('/newAddress', userController.newAddress)
user_router.post('/addNewAddress', userController.addNewAddress)
user_router.get("/editAddress",userController.loadEditAddress)
user_router.post("/updateAddress",userController.verifyUpdateAddress)
user_router.get("/deleteAddress", userController.deleteAddress);


user_router.get("/login", isLogout, loginController.loginGet)
user_router.post("/signup", signUpController.signUpPost)
user_router.post("/login", loginController.loginPost)
user_router.get("/logout", userController.logout)


user_router.get("/forgotPassword", isLogout, loginController.forgotPassword)
user_router.post("/verifyEmail", isLogout, loginController.verifyForgotEmail)
user_router.get("/forgotPasswordOtp", isLogout, loginController.forgotPasswordOtp)
user_router.post("/verifyForgotPasswordOtp", isLogout, loginController.verifyForgotPasswordOtp)
user_router.get("/resetPassword", isLogout, loginController.loadResetPassword)
user_router.post("/resetPassword", isLogout, loginController.verifyResetPassword)


user_router.get("/products", blockCheck, productController.products)
user_router.get("/allProducts", blockCheck, productController.allProducts)
user_router.get("/productView", productController.loadProductView)
user_router.get("/offerProducts",productController.offerProducts)


user_router.get("/categoryFilter",productController.categoryFilter)
user_router.get("/subCategoryFilter",productController.subCategoryFilter)
user_router.get("/originalProductData",productController.originalProductData)
user_router.post("/sortProduct",productController.sortProduct)



user_router.get("/cart", isLogin, blockCheck, cartController.loadCart)
user_router.post("/addToCart", isLogin,blockCheck, cartController.addToCart)
user_router.post('/updateCart', cartController.updateCart)
user_router.get('/getStock',cartController.getStock)
user_router.get("/removeFromCart", cartController.removeFromCart)
user_router.get("/checkOut", isCheckout, isLogin, blockCheck, cartController.loadCheckOut)
user_router.post("/validateCoupon", cartController.validateCoupon);

user_router.post("/placeOrder", orderController.placeOrder)
user_router.get("/orderSuccess",  isLogin, blockCheck,orderController.orderSuccess)
user_router.get("/myOrder", isLogin, blockCheck, orderController.myOrders)
user_router.get("/orderdetails",isLogin, blockCheck, orderController.orderDetails)
user_router.get("/orderFilter", orderController.filterOrder);
user_router.post("/updateOrder", orderController.updateOrder);


user_router.get("/otp", isLogout, otpController.otpGet)
user_router.post("/otpEnter", isLogout, otpController.otpVerify)










module.exports = user_router