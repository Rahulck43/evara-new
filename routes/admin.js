var express = require('express');
var router = express.Router();
const layout = ('layouts/adminLayout')
const adminHelper = require('../helper/admin-helper')
const productHelper=require('../helper/product-helper')
const categoryHelper=require('../helper/category-helper')
const userModel = require('../models/user-model')
const upload=require('../config/multer');
const { getDashboard, getLogin, postLogin, getLogout, getProductsPage, getAddProduct, postAddProduct, getEditProduct, postEditProduct, getDeleteProduct, getUsersList, blockUser, getCategoryList, getCategory, postAddCategory, postEditCategory, getAllOrders, toggleCategory, getUpdateOrderStatus, getSingleOrder,  getAddCoupon, postAddCoupon, getCoupons, getEditCoupon, postEditCoupon,  getAddBanner, postAddBanner, getBanners, getEditBanner, postEditBanner, getDeleteBanner,}=require('../controllers/admin-controller');


const verifyAdmin=(req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        res.redirect('/admin')
    }
}



router.get('/', getDashboard );

// ***************************************LOGIN******************************************
router.get('/login', getLogin );
router.post('/login', postLogin )
router.get('/logout',getLogout)


// ***************************************PRODUCTS******************************************
router.get('/products',verifyAdmin, getProductsPage );
router.get('/addproduct',verifyAdmin, getAddProduct );
router.post('/addproduct',verifyAdmin,upload.array('testImage',4),postAddProduct)
router.get('/editproduct/:id',verifyAdmin,getEditProduct)
router.post('/editproduct/:id',verifyAdmin,upload.array('testImage',4), postEditProduct)
router.get('/deleteproduct/:id',verifyAdmin,getDeleteProduct)


// ***************************************USERS******************************************
router.get('/userlist',verifyAdmin, getUsersList )
router.put('/userlist/:id',verifyAdmin, blockUser )


// ***************************************CATEGORY******************************************
router.get('/category',verifyAdmin,getCategoryList)
router.get('/category/:id',verifyAdmin,getCategory)
router.post('/addcategory',verifyAdmin,postAddCategory)
router.post('/editcategory/:id',verifyAdmin,postEditCategory)
router.get('/toggle-category/:id',verifyAdmin,toggleCategory)


// ****************************************ORDERS********************************************
router.get('/orders',verifyAdmin,getAllOrders)
router.get('/update-order-status/:id',verifyAdmin,getUpdateOrderStatus)
router.get('/order/:id',verifyAdmin,getSingleOrder)


//***************************************COUPON******************************************
router.get('/coupons',verifyAdmin,getCoupons)
router.get('/add-coupon',verifyAdmin,getAddCoupon)
router.post('/add-coupon',verifyAdmin,postAddCoupon)
router.get('/edit-coupon/:id',verifyAdmin,getEditCoupon)
router.post('/edit-coupon/:id',verifyAdmin,postEditCoupon)


//***************************************BANNER******************************************
router.get('/add-banner',verifyAdmin,getAddBanner)
router.post('/add-banner',verifyAdmin,postAddBanner)
router.get('/banners',verifyAdmin,getBanners)
router.get('/edit-banner/:id',verifyAdmin,getEditBanner)
router.post('/edit-banner/:id',verifyAdmin,postEditBanner)
router.get('/delete-banner/:id',verifyAdmin,getDeleteBanner)



module.exports = router;