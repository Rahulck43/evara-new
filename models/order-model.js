const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const orderSchema = new Schema({
    id: String,
    name: String,
    billing_address: String,
    city: String,
    district: String,
    state: String,
    zipcode: Number,
    phone: Number,
    payment_option: String,
    products: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: Number
        }
    ],
    status: String,
    date: {
        type: Date,
        default: Date.now
    },
    totalAmount: Number,
    couponCode: {
        type:String
    }
})

module.exports = mongoose.model('order', orderSchema)



