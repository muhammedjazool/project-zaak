const  mongoose=require("mongoose")

const categorySchema= new mongoose.Schema({
    imageUrl:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    category:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    
    isNotBlocked:{
        type:Boolean,
        required:true,
    }
})

module.exports= mongoose.model("category",categorySchema)