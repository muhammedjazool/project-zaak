const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const SubCategory = require("../../model/subCategoryModel");
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");

exports.loadSubCategory = async (req, res) => {

  try {
   
   
    const subCategoryData = await SubCategory.find().populate('categoryId', 'category');
   
if(req.session.subCategoryUpdate){
   
     res.render("subCategory", {
          title: "Sub Category",
          subCategoryData,
        
          user: req.session.admin,
        });
        req.session.subCategoryUpdate = false;
}
    else if (req.session.subCategorySave) {
   
      res.render("subCategory", {
        title: "Sub Category",
        subCategoryData,
       
        user: req.session.admin,
      });
      req.session.subCategorySave = false;
    } else if (req.session.subCategoryExist) {
  
      res.render("subCategory", {
        title: "Sub Category",
        subCategoryData,
              user: req.session.admin,
      });
      req.session.subCategoryExist=false
    }else {
     res.render("subCategory", { title:"Sub Category",
        subCategoryData,
     
        user: req.session.admin });
   }
  } catch (error) {
    console.log(error)
  }
};

exports.loadAddSubCategory = async(req, res) => {
  try {
    
    const categoryData=await Category.find()
    res.render("addSubCategory", { title: "Sub Category", categoryData ,user: req.session.admin, });
  } catch (error) {
    console.log(error)
  }
};

exports.verifyAddSubCategory = async (req, res) => {

  try {
    const { name, subCategoryDescription ,category} = req.body;

    const image = req.file;
 

    const lowerSubcategoryName = name.toLowerCase();

    const result = await cloudinary.uploader.upload(image.path, {
      folder: "Sub Categories",
    });

    const subCategoryExist = await SubCategory.findOne({
      subCategory: lowerSubcategoryName,
    });
  

    if (!subCategoryExist) {
      const newSubCategory = new SubCategory({
        subCategory: lowerSubcategoryName,
        imageUrl: {
          public_id: result.public_id,
          url: result.secure_url,
        },
        description: subCategoryDescription,
        categoryId:category,
        is_blocked: false,
      });

      await newSubCategory.save();
      req.session.subCategorySave = true;
      res.redirect("/admin/subCategory");
    } else {
    
      req.session.subCategoryExist = true;
      res.redirect("/admin/subCategory");
    }
  } catch (error) {
    console.log(error);
  }
};



exports.editSubCategory= async (req,res)=>{
     try {
          const subCategoryId= req.params.id
          const subCategoryData= await SubCategory.findById({ _id: subCategoryId});
          res.render("editSubCategory", {title:"Edit Sub Category", subCategoryData, user: req.session.admin });
     } catch (error) {
          console.log(error);
     }
}



exports.updateSubCategory=async(req,res)=>{
     try {
          const subCategoryId=req.params.id
          const subCategoryName=req.body.name
          const subCategoryDescription = req.body.subCategoryDescription;
          const newImage = req.file;


          const subCategoryData = await SubCategory.findById(subCategoryId);
          const subCategoryImageUrl = subCategoryData.imageUrl.url;
          if (newImage) {
               if (subCategoryImageUrl) {
                 await cloudinary.uploader.destroy(subCategoryData.imageUrl.public_id);
               }
         
               result = await cloudinary.uploader.upload(newImage.path, {
                 folder: "Sub Categories",
               });
             } else {
               result = {
                 public_id: subCategoryData.imageUrl.public_id,
                 secure_url: subCategoryImageUrl,
               };
             }
         
             const subCatExist = await SubCategory.findOne({ subCategory: subCategoryName });
             const imageExist = await SubCategory.findOne({
               "imageUrl.url": result.secure_url,
             });
             const descriptionExist = await SubCategory.findOne({description: subCategoryDescription})
             if (!subCatExist || !imageExist || !descriptionExist) {
               await SubCategory.findByIdAndUpdate(
                 subCategoryId,
                 {
                   subCategory: subCategoryName,
                   imageUrl: {
                     public_id: result.public_id,
                     url: result.secure_url,
                   },
                   description: subCategoryDescription,
                 },
                 { new: true }
               );
               req.session.subCategoryUpdate = true;
               res.redirect("/admin/subCategory");
             } else {
               req.session.subCategoryExist = true;
               res.redirect("/admin/editSubCategory/:id");
             }
           } catch (error) {
             console.log(error.message);
           }
         };



exports.unListSubCategory=async(req,res)=>{
   
     const Id=req.params.subCategoryDataId
   
     const unList=await SubCategory.findById(Id)

  await SubCategory.findByIdAndUpdate(Id,{$set:{is_blocked: !unList.is_blocked}})
  res.redirect("/admin/subCategory")
}