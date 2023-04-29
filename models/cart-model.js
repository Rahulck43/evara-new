const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const cartSchema = new Schema({
    id: String,
    products: [
        {
            item: String,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]

})



module.exports = mongoose.model('cart', cartSchema)


