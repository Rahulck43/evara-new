const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bannerSchema= new Schema({

    name:{type:String, require:true},
    header1: {type:String, require:true},
    header2: {type:String, require:true},
    description: {type:String, require:true},
    image: {type:String, require:true},
    status: {type:Boolean, defaul:true},
    link: {type: String, default: '/shop'}
})


module.exports= mongoose.model('banner',bannerSchema)