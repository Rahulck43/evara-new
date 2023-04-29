const mongoose = require("mongoose");
const Schema = mongoose.Schema




const couponSchema = new Schema({

    couponName: { type: String, required: true },
    couponCode: { type: String, required: true, unique: true },
    validity: { type: Date, required: true },
    minPurchase: { type: Number, required: true },
    discount: { type: Number, required: true },
    maxDiscount: { type: Number, required: true },
    description: { type: String, required: true },
    isActive: { type:Boolean, default:true },
    users: []
})

module.exports = mongoose.model('coupon', couponSchema)
