    const mongoose = require("mongoose")


    const productSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        imageUrl: [
            {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        stock: [{
            small: {
                type: Number,
                required: true,
            },
            medium: {
                type: Number,
                required: true,
            },
            large: {
                type: Number,
                required: true,
            },
            xlarge: {
                type: Number,
                required: true,
            },
        }],

        available:{
            type:Boolean,
            default:true,
        },
        
        isOnCart: {
            type: Boolean,
            default: false,
        },
    
    })

    module.exports = mongoose.model("Product", productSchema)