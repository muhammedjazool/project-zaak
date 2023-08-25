const mongoose=require("mongoose")

const subCategorySchema=new mongoose.Schema({
     subCategory:{
          type:String,
          require:true,
     },
     imageUrl:{
          public_id:{
               type:String,
               required:true,
          },
          url:{
               type:String,
               required:true,
          }
     },
     description:{
          type:String,
          require:true,
     },
     is_blocked: {
          type: Boolean,
          default: false,
      },
      categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "category",
          required: true,
      },
})

module.exports=mongoose.model("subCategory",subCategorySchema)