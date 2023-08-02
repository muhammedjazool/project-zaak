const mongoose = require("mongoose")
const userSchema=new mongoose.Schema({
     name:{
        type:String,
        required:true,
     },
     email:{
        type:String,
        required:true,
     },
     phone:{
        type:String,
        required:true,
     },
     password:{
        type:String,
        required:true,
     },
     isNotBlocked:{
      type:Boolean,
      required:true,
     },
     cart: [
      {
          product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
          },
          quantity: {
              type: Number,
              default: 1,
          },
      },
  ],
})
module.exports=mongoose.model("user",userSchema)