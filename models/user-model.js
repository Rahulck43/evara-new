const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: [true, "can't be blank"] },
    mobileNo:{ type: Number, required:[true,"can't be blank"]},
    email: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true },
    password: {
        type: String,
        required: [true, "can't be blank"]
    },
    status: { type: Boolean, required: true, default: true },
    addresses:[],
    wallet: { type:Number, default:0 }
});




module.exports = mongoose.model('user', userSchema)


