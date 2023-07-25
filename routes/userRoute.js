const express=require("express")
const user_router= express.Router()
const userController= require("../controller/userControllers/user_controller")
const loginController= require("../controller/userControllers/login_controller")
const signUpController= require("../controller/userControllers/signUp_controller")
const otpController= require("../controller/userControllers/otp_controller")
////////////user get////////////

user_router.get("/",userController.homePage)


user_router.get("/login",loginController.loginGet)
user_router.post("/login",loginController.loginPost)
user_router.get("/logout",userController.logout)

user_router.get("/home",userController.homeLoad)



user_router.post("/signup",signUpController.signUpPost)


user_router.get("/otp",otpController.otpGet)
user_router.post("/otpEnter",otpController.otpVerify)


user_router.get("/wishlist",userController.wishlistLoad)







module.exports =user_router