const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required: [true,"Please enter product name"]
        },
        quantity:{
            type:Number,
            requried:true,
            default:0
        },
        price:{
            type:Number,
            required:true,
            default:1,
            validate:{
                validator:function(value){
                    return value >=1 && value <= 10;
                },
                message:"price ({VALUE}) should be above 1 and below 10"
            }
        },
        image:{
            type:String,
            required:false
        }
    },
    {
        timestamps:true,
    }
);
const Product = mongoose.model("Product",ProductSchema);
module.exports = Product;
