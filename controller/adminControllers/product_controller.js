const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const cloudinary = require("../../config/cloudinary");

exports.loadProducts = async (req, res) => {
     try {
          const productData = await Product.aggregate([
               { $match: { category: { $exists: true } } },
               {
                    $lookup: {
                         from: "categories",
                         localField: "category",
                         foreignField: "_id",
                         as: "newCategory",
                    },
               },
               {
                    $unwind: {
                         path: "$newCategory",
                         preserveNullAndEmptyArrays: true,
                    },
               },
          ]);

          if (req.session.products) {
               res.render("products", {
                    title: "Products",
                    productData,
                    productUpdate: "Added successfully",
                    user: req.session.admin,
               });
               req.session.products = false;
          } else {
               res.render("products", {
                    title: "Products",
                    productData,
                    user: req.session.admin,
               });
          }
     } catch (error) {
          console.log(error.message);
     }
};




exports.loadAddProducts = async (req, res) => {
     try {
          const categories = await Category.find();
          res.render("addProduct", {
               title: "Add Products",
               categories,
               user: req.session.admin,
          });
     } catch (error) {
          console.log(error.message);
     }
};




exports.verifyAddProducts = async (req, res) => {
     try {
          const { name, price, category, description, small, medium, large, xlarge } =
               req.body;
          const images = req.files;
          const uploadedImages = [];

          for (let image of images) {
               const result = await cloudinary.uploader.upload(image.path, {
                    folder: "Products",
               });

               uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url,
               });
          }

          const sizeArray = [
               {
                    small,
                    medium,
                    large,
                    xlarge,
               },
          ];

          console.log("here is the sizeArray", sizeArray);

          const newProduct = new Product({
               name,
               price,
               description,
               category,
               imageUrl: uploadedImages,
               stock: sizeArray,
          });

          console.log("here is newProduct", newProduct);
          console.log("stock", newProduct.stock);

          await newProduct.save();
          req.session.products = true;
          res.redirect("/admin/products");
     } catch (error) {
          console.log(error);
     }
};




exports.loadEditProducts = async (req, res) => {
     const productId = req.params.id;
     try {
          const productToEdit = await Product.findById({_id:productId});
          const categories = await Category.find();

          res.render("editProducts", {
               title: "Edit Products",
               categories,
               productToEdit,
               user: req.session.admin,
          });
     } catch (error) {
          console.log(error);
     }
};








exports.verifyEditProducts = async (req, res) => {

     try {
          const productId = req.params.id
          const productToEdit = await Product.findById(productId)
          // const existImage = product.imageUrl
          const files = req.files
          
          console.log(149,productId);
          console.log(150,product);
          // console.log(151,existImage);
          console.log(152,files);


//           let newImages = []


//           if (files & files.length > 0) {
//                for (const file of files) {
//                     const result = await cloudinary.uploader.upload(file.path, {
//                          folder: "Products",
//                     })

//                     const image = {
//                          public_id: result.public_id,
//                          url: result.secure_url,
//                     };

//                     newImages.push(image);
//                }
                 
//                console.log(172,newImages);

//                newImages = [...existImage, ...newImages]
//                product.imageUrl = newImages;
//                const something=product.imageUrl

// console.log(177,newImages);
// console.log(178,something);

//           } else {
//                newImages = exImage;

//                console.log(184,newImages);
//           }

          const {name,price,small,medium,large,xlarge,category,description}=req.body

          const newSizeArray = [
               {
                    small,
                    medium,
                    large,
                    xlarge,
               },
          ];
 

          console.log(199,newSizeArray);

          await Product.findByIdAndUpdate(
               productId,
               {
                   name: name,
                   price: price,
                   stock: newSizeArray,
                   description: description,
                   category: category,
                   brand: brandId,
               //     imageUrl: newImages,
                  
               },
               { new: true }
           );
           req.session.productUpdate = true;
           res.redirect("/admin/products");
     } catch (error) {
          console.log(error);
     }

}