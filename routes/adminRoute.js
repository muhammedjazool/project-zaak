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
const bannerController = require("../controller/adminControllers/banner_controller")
const subCategoryController = require("../controller/adminControllers/subCategory_controller")

const { isLogged } = auth

admin_router.get("/",adminController.adminLogin)
admin_router.post("/",adminController.verifyLogin)
admin_router.get("/logout",adminController.logoutAdmin)


admin_router.get("/dashboard", isLogged, dashboardController.loadDashboard)
admin_router.get("/chartData", dashboardController.chartData);
admin_router.get("/generateSalesReport", isLogged,dashboardController.generateSalesReport);
admin_router.post('/downloadSalesReport', dashboardController.downloadSalesReport)
// admin_router.get('/renderSalesReport', dashboardController.renderSalesReport)




admin_router.get("/user", isLogged, usersController.getUser)
admin_router.get("/is_Blocked/:userId", isLogged, usersController.loadBlockOrUnblock)


admin_router.get("/categories", isLogged, categoryController.loadCategory)
admin_router.get("/addCategory", isLogged, categoryController.addCategory)
admin_router.post("/addCategory", isLogged, store.single("image"), categoryController.addNewCategory)
admin_router.get("/editCategory/:id", isLogged, categoryController.editCategory)
admin_router.post("/updateCategory/:id", isLogged, store.single("image"), categoryController.updateCategory)
admin_router.get("/unListCategory/:categoryDataId", isLogged, categoryController.unListCategory)

admin_router.get("/subCategory",isLogged,subCategoryController.loadSubCategory)
admin_router.get("/addSubCategory",isLogged,subCategoryController.loadAddSubCategory)
admin_router.post("/addSubCategory",isLogged,store.single("image"),subCategoryController.verifyAddSubCategory)
admin_router.get("/editSubCategory/:id", isLogged, subCategoryController.editSubCategory)
admin_router.post("/updateSubCategory/:id", isLogged, store.single("image"), subCategoryController.updateSubCategory)
admin_router.get("/unListSubCategory/:subCategoryDataId", isLogged, subCategoryController.unListSubCategory)


admin_router.get("/banners", isLogged, bannerController.loadBanners);
admin_router.get("/addBanner", isLogged, bannerController.addBanner);
admin_router.post("/addBanner", isLogged, store.single("image"), bannerController.addNewBanner);
admin_router.get("/updateBanner/:id", isLogged, bannerController.editBanner);
admin_router.post("/updateBanner/:id", isLogged, store.single("image"), bannerController.updateBanner);
admin_router.get("/bannerStatus/:id", isLogged, bannerController.bannerStatus);

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