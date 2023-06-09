const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const wishlistSchema = new Schema({
    id: String,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
          }
    ]
})



module.exports = mongoose.model('wishlist', wishlistSchema)


