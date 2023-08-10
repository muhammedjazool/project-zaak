const express = require("express")
const admin_router = express.Router()
const auth = require("../middleware/adminAuth.js")
const store = require("../middleware/multer.js")
const adminController = require("../controller/adminControllers/admin_controller")
const dashboardController = require("../controller/adminControllers/dashboard_controller")
const usersController = require("../controller/adminControllers/users_controller")
const categoryController = require("../controller/adminControllers/category_controller")
const productController = require("../controller/adminControllers/product_controller")
const orderController = require("../controller/adminControllers/order_controller")
const couponController = require("../controller/adminControllers/coupon_controller")

const { isLogged } = auth

admin_router.get("/",adminController.adminLogin)
admin_router.post("/",adminController.verifyLogin)
admin_router.get("/logout",adminController.logoutAdmin)


admin_router.get("/dashboard", isLogged, dashboardController.getDashboard)



admin_router.get("/user", isLogged, usersController.getUser)
admin_router.get("/is_Blocked/:userId", isLogged, usersController.loadBlockOrUnblock)


admin_router.get("/categories", isLogged, categoryController.loadCategory)
admin_router.get("/addCategory", isLogged, categoryController.addCategory)
admin_router.post("/addCategory", isLogged, store.single("image"), categoryController.addNewCategory)
admin_router.get("/editCategory/:id", isLogged, categoryController.editCategory)
admin_router.post("/updateCategory/:id", isLogged, store.single("image"), categoryController.updateCategory)
admin_router.get("/unListCategory/:categoryDataId", isLogged, categoryController.unListCategory)


admin_router.get("/products", isLogged, productController.loadProducts)
admin_router.get("/addProducts", isLogged, productController.loadAddProducts)
admin_router.post("/addProducts", isLogged, store.array("image", 4), productController.verifyAddProducts)
admin_router.get("/editProducts/:id", isLogged, store.array("image", 4), productController.loadEditProducts)
admin_router.post("/updateProducts/:id", isLogged, store.array("image", 5), productController.updateProducts)
admin_router.get("/deleteProduct/:id", isLogged, productController.deleteProduct);



admin_router.get("/orders", isLogged,orderController.loadOrders);
admin_router.post("/updateOrder", orderController.updateOrder);
admin_router.get("/orderDetails",isLogged, orderController.orderDetails);




admin_router.get("/coupons", isLogged,couponController.loadCoupons);
admin_router.get("/loadAddCoupon", isLogged,couponController.loadAddCoupon);
admin_router.post("/addCoupon",couponController.addCoupon);
admin_router.post("/blockCoupon",couponController.blockCoupon);
admin_router.post("/deleteCoupon",couponController.deleteCoupon);

module.exports = admin_router