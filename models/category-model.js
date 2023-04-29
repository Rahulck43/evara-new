const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const categorySchema= new Schema({

    category:{
        type:String,
        unique: true,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }

})


module.exports = mongoose.model('category', categorySchema);
