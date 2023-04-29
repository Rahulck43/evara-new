var express = require('express');
var router = express.Router();
const{getHome,getCategories, getShop, getLogin, postLogin, postSignup, getLogout, addToCart, removeFromCart, getClearCart, getCartPage, getProductPage, getCheckout, postChangeProductQuantity, getOtpLogin, postOtpLogin, otpSubmit, postCheckout, getMyOrders, getSingleOrder, getRetunOrder, getCancelOrder, postCouponValidate, getRemoveCoupon, orderPlaced, postVerifyPayment, paymentFailed, getMyAccount, addToWishlist, getWishlistPage, removeFromWishlist, getAddAddress, postAddAddress, getEditAddress, postEditAddress, getRemoveAddress, getInvoice, getSearchProducts, }=require('../controllers/user-controller');

const verifyLogin=(req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}


router.use (getCategories)



router.get('/',getHome);

// ***************************LOGIN***************************
router.get('/login',getLogin)
router.post('/login',postLogin)
router.get('/otp-login',getOtpLogin)
router.post('/otp-login',postOtpLogin)
router.post('/otp-submit',otpSubmit)
router.post('/signup', postSignup )
router.get('/logout',getLogout)


// ****************************PRODUCT*************************
router.get('/shop',getShop)
router.get('/product/:id',getProductPage)
router.post('/search/:key',getSearchProducts)


// *******************************CART****************************
router.get( '/cart',verifyLogin,getCartPage)
router.get('/add-to-cart/:id',verifyLogin,addToCart)
router.get('/remove-from-cart/:id',verifyLogin,removeFromCart)
router.get('/clear-cart',verifyLogin,getClearCart)
router.post('/change-product-quantity',verifyLogin,postChangeProductQuantity)


// *******************************WISHLIST****************************
router.get('/add-to-wishlist/:id',verifyLogin,addToWishlist)
router.get('/wishlist',verifyLogin,getWishlistPage)
router.get('/remove-from-wishlist/:id',verifyLogin,removeFromWishlist)



// *********************************CHECKOUT************************
router.get('/checkout',verifyLogin,getCheckout)
router.post('/checkout',verifyLogin,postCheckout)
router.post('/coupon-apply',verifyLogin,postCouponValidate)
router.get('/remove-coupon',verifyLogin,getRemoveCoupon)
router.get('/order-placed',verifyLogin,orderPlaced)
router.get('/payment-failed',verifyLogin,paymentFailed)
router.post('/verify-payment',verifyLogin,postVerifyPayment)


// **********************************ORDERS****************************
router.get('/my-orders',verifyLogin,getMyOrders)
router.get('/order/:id',verifyLogin,getSingleOrder)
router.get('/return-order/:id',verifyLogin,getRetunOrder)
router.get('/cancel-order/:id',verifyLogin,getCancelOrder)
router.get('/invoice/:id',verifyLogin,getInvoice)


// **********************************ACCOUNT****************************

router.get('/my-account',verifyLogin,getMyAccount)
router.get('/add-address',verifyLogin,getAddAddress)
router.post('/add-address',verifyLogin,postAddAddress)
router.get('/edit-address',verifyLogin,getEditAddress)
router.post('/edit-address',verifyLogin,postEditAddress)
router.get('/remove-address',verifyLogin,getRemoveAddress)









module.exports = router;
