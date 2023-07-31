const Category = require("../../model/categoryModel")
const User = require("../../model/userModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")

// exports.products=async(req,res)=>{
//      const categoryData=await Category.find({isBlocked:true})
//      // const userDetail = await User.find()
//      const userDetail = await User.findOne({ email: req.session.email })
//     console.log(9,userDetail);

//      try {
//           const page =parseInt(req.query.page) || 1;
//           const productsPerPage = 6;

//           const id=req.query.id;
//           let productData;
//           let totalCount;

//           const isCategory= await Category.exists({_id:id});
 
//           if(isCategory){
//                productData = await Product.find({category:id})
//                .skip((page -1)* productsPerPage)
//                .limit(productsPerPage)
//                totalCount = await Product.countDocuments({ category: id });
//           }
//           const totalPages=Math.ceil(totalCount/productsPerPage)
         
//           const userData=req.session.user
//           var val=(userData)?true:false
//           console.log(30,val);
          
//           res.render("userProducts",{title:"Products" ,
//            categoryData,
//            userData,
//            productData,
//            userDetail,
//            currentPage:page,
//            totalPages,
//      })
//      } catch (error) {
//           console.log(error)
//      }
// }

// exports.products = async (req, res) => {
//      const categoryData = await Category.find({ isBlocked: true });
   
//      try {
//        const page = parseInt(req.query.page) || 1;
//        const productsPerPage = 6;
   
//        const id = req.query.id;
//        let productData;
//        let totalCount;
   
//        const isCategory = await Category.exists({ _id: id });
   
//        if (isCategory) {
//          productData = await Product.find({ category: id })
//            .skip((page - 1) * productsPerPage)
//            .limit(productsPerPage);
//          totalCount = await Product.countDocuments({ category: id });
//        }
//        const totalPages = Math.ceil(totalCount / productsPerPage);
   
//        const userData = req.session.user;
//        const userDetail = req.session.email ? await User.findOne({ email: req.session.email }) : null; // Fetch userDetail only if the user is logged in
   
//        res.render("userProducts", {
//          title: "Products",
//          categoryData,
//          ...(userData && userDetail
//            ? { userData, userDetail } // Render userData and userDetail only if the user is logged in
//            : {}), // Empty object if the user is not logged in
//          productData,
//          currentPage: page,
//          totalPages,
//        });
//      } catch (error) {
//        console.log(error);
//      }
//    };


exports.products = async (req, res) => {
  const categoryData = await Category.find({ isBlocked: true });
  const userDetail = req.session.email ? await User.findOne({ email: req.session.email }) : null;

  try {
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 6;

    const id = req.query.id;
    let productData;
    let totalCount;

    const isCategory = await Category.exists({ _id: id });

    if (isCategory) {
      productData = await Product.find({ category: id })
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
      totalCount = await Product.countDocuments({ category: id });
    }
    const totalPages = Math.ceil(totalCount / productsPerPage);

    const userData = req.session.user;

    if (userData && userDetail) {
      // Render userData and userDetail only if the user is logged in
      res.render("userProducts", {
        title: "Products",
        categoryData,
        userData,
        userDetail,
        productData,
        currentPage: page,
        totalPages,
      });
    } else {
      // Render without user-specific data if the user is not logged in
      res.render("userProducts", {
        title: "Products",
        categoryData,
        productData,
        currentPage: page,
        totalPages,
      });
    }
  } catch (error) {
    console.log(error);
  }
};


 exports.loadProductView = async (req, res) => {
     try {
       const productId = req.query.id;
       const productData = await Product.findById(productId);
       const categoryData = await Category.find({ isBlocked: true });
   
       if (req.session.user) {
         const userData = req.session.user;
   
         if (!productData) {
           res.render("404", { userData, categoryData });
         } else {
           res.render("productView", {title:"Product View", productData, categoryData, userData });
         }
       } else {
         if (!productData) {
           res.render("404", { categoryData });
         } else {
           res.render("productView", {title:"Product View", productData, categoryData });
         }
       }
     } catch (error) {
       console.log(error.message);
       const userData = req.session.user;
       const categoryData = await Category.find({ is_blocked: false });
       res.render("404", { userData, categoryData });
     }
   };
   