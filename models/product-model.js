
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const multer = require('multer');
const path = require('path');



const productSchema = new Schema({
    name: String,
    description: String,
    category:String,
    price: Number,
    image:[],
    isDeleted:{type:Boolean,default:false},
    isStock:{type:Boolean,default:true},
    stockQuantity:Number
  });
  
  module.exports = mongoose.model('Product', productSchema);


 
