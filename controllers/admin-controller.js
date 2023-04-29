var express = require('express');
const layout = ('layouts/adminLayout')
const adminHelper = require('../helper/admin-helper')
const productHelper = require('../helper/product-helper')
const categoryHelper = require('../helper/category-helper')
const couponHelper = require('../helper/coupon-helper')
const bannerHelper = require('../helper/bannerHelper')
const userModel = require('../models/user-model')
const upload = require('../config/multer');
const userHelper = require('../helper/user-helper');
const orderModel = require('../models/order-model');


let cat



module.exports = {

    getDashboard: async (req, res) => {
        try {
            if (req.session.admin) {
                const salesByMonth = await adminHelper.getSalesDetails()
                const salesByYear = await adminHelper.getYearlySalesDetails()
                const orders = await adminHelper.allOrders()
                const ordersByDate = await adminHelper.getOrdersByDate()
                const categorySales = await adminHelper.getCategorySales()
                const allProducts = await productHelper.getAllProducts()
                const allUsers = await adminHelper.getAllUsers()
                const currentMonth = new Date().getMonth() + 1;
                const currentMonthSales = await salesByMonth.find(sales => sales._id === currentMonth)
                res.render('admin/index', { layout, salesByMonth, salesByYear, orders, currentMonthSales, allProducts, allUsers, ordersByDate, categorySales })
            } else {
                res.render('admin/login', { layout: false });
            }
        } catch (error) {
            res.render('admin/login', { layout: false })
        }
    },

    getLogin: (req, res) => {
        res.render('admin/login', { layout: false })
    },

    postLogin: (req, res) => {
        adminHelper.adminLogin(req.body).then((response) => {
            req.session.admin = response.admin
            res.redirect('/admin')
        }).catch(() => {
            const invalid = 'incorrect username or password....!!!!'
            res.render('admin/login', { layout: false, invalid })
        })
    },

    getLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin')
    },

    getProductsPage: (req, res) => {
        productHelper.getAllProducts().then((products) => {
            res.render('admin/productlist', { layout, products })
        }).catch((error) => {
            res.render('admin/productlist', { layout })
        })
    },

    getAddProduct: (req, res) => {
        const admin = req.session.admin
        productHelper.getCategories().then((categories) => {
            res.render('admin/addproducts', { admin, layout, categories })
        }).catch((error) => {
            res.redirect('/admin')
        })
    },

    postAddProduct: (req, res) => {
        const files = req.files
        const images = files.map((file) => {
            return file.filename
        })
        productHelper.addProduct(req.body, images).then(() => {
            res.redirect('/admin/products')
        }).catch(() => {
            res.redirect('/admin')
        })
    },

    getEditProduct: async (req, res) => {
        try {
            const productId = req.params.id
            const product = await productHelper.findProduct(productId)
            const categories = await productHelper.getCategories()
            res.render('admin/editproduct', { product, layout, categories })
        } catch {
            res.redirect('/admin/products')
        }
    },

    postEditProduct: (req, res) => {
        let files = req.files
        const productId = req.params.id
        let images
        if (!files[0]) {
            images = false
        } else {
            images = files.map((file) => {
                return file.filename
            })
        }
        productHelper.editProduct(productId, req.body, images).then((resolve) => {
            res.redirect('/admin/products')
        }).catch(() => {
            res.redirect('/admin/products')
        })
    },

    getDeleteProduct: (req, res) => {
        const productId = req.params.id
        productHelper.deleteProduct(productId).then((result) => {
            res.redirect('/admin/products')
        }).catch((error) => {
            res.redirect('/admin/products')
        })
    },

    getUsersList: (req, res) => {
        adminHelper.getAllUsers().then((users) => {
            res.render('admin/userlist', { layout, users })
        }).catch((error) => {
            res.render('admin/userlist', { layout })
        })
    },

    blockUser: (req, res, next) => {
        const id = req.params.id
        adminHelper.blockUser(id).then((response) => {
            res.status(202).json(response)
        })
    },

    getCategoryList: (req, res) => {
        categoryHelper.getAllCategory().then((categories) => {
            if (cat) {
                let category = cat
                res.render('admin/category', { layout, categories, category })
                cat = false
            } else {
                res.render('admin/category', { layout, categories })
            }
        })
    },

    getCategory: (req, res) => {
        const id = req.params.id
        categoryHelper.getCategory(id).then((response) => {
            cat = response
            res.redirect('/admin/category')
        }).catch(() => {
            res.redirect('/admin/category')
        })
    },

    postAddCategory: (req, res) => {
        const category = req.body.category
        categoryHelper.addCategory(category).then((resolve) => {
            res.redirect('/admin/category')
        }).catch(() => {
            res.redirect('/admin/category')
        })
    },

    postEditCategory: async (req, res) => {
        try {
            const id = req.params.id
            const category = req.body.category
            const oldCategory = req.body.oldCategory
            await categoryHelper.editCategory(id, category)
            await categoryHelper.editCategoryProducts(category, oldCategory)
            res.redirect('/admin/category')
        } catch (error) {
            res.redirect('/admin/category')
        }
    },


    toggleCategory: (req, res) => {
        const id = req.params.id
        categoryHelper.toggleCat(id).then(() => {
            res.redirect('/admin/category')
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err.message);
        })
    },

    getAllOrders: (req, res) => {
        adminHelper.allOrders().then((orders) => {
            res.render('admin/all-orders', { layout, orders })
        }).catch(()=>{
            res.redirect('/admin')
        })
    },

    getUpdateOrderStatus: (req, res) => {
        const orderId = req.params.id
        const newStatus = req.query.status
        adminHelper.UpdateOrderStatus(orderId, newStatus).then((response) => {
            res.redirect('/admin/orders')
        }).catch(() => {
            res.redirect('/admin')
        })
    },

    getSingleOrder: (req, res) => {
        const orderId = req.params.id
        adminHelper.singleOrder(orderId).then((orderDetails) => {
            res.render('admin/single-order', { layout, orderDetails })
        }).catch(() => {
            res.redirect('/admin/orders')
        })
    },


    getCoupons: (req, res) => {
        couponHelper.getAllCoupons().then((coupons) => {
            res.render('admin/couponlist', { layout, coupons })
        }).catch((error) => {
            res.status(500).send('Internal Server Error');
        })
    },

    getAddCoupon: (req, res) => {
        res.render('admin/addCoupon', { layout })
    },

    postAddCoupon: (req, res) => {
        couponHelper.addCoupon(req.body).then((newCoupon) => {
            res.redirect('/admin/coupons')
        }).catch((error) => {
            res.redirect('/admin/add-coupon')
        })
    },

    getEditCoupon: (req, res) => {
        const couponId = req.params.id
        couponHelper.findCoupon(couponId).then((coupon) => {
            res.render('admin/editCoupon', { layout, coupon })
        }).catch((error) => {
            res.redirect('/admin/coupons')
        })
    },

    postEditCoupon: (req, res) => {
        const couponId = req.params.id
        const couponData = req.body
        couponHelper.editCoupon(couponId, couponData).then(() => {
            res.redirect('/admin/coupons')
        }).catch((error) => {
            res.redirect('/admin')
        })
    },

    getBanners: (req, res) => {
        bannerHelper.getAllBanners().then((banners) => {
            res.render('admin/banners', { layout, banners })
        }).catch(()=>{
            res.redirect('/admin')
        })
    },

    getAddBanner: (req, res) => {
        res.render('admin/add-banner', { layout })
    },

    postAddBanner: (req, res) => {
        const bannerDetails = req.body
        bannerHelper.addBanner(bannerDetails).then(() => {
            res.redirect('/admin/banners')
        }).catch(()=>{
            res.redirect('/admin')
        })
    },

    getEditBanner: (req, res) => {
        const banner = req.params.id
        bannerHelper.findBanner(banner).then((bannerDetails) => {
            res.render('admin/edit-banner', { layout, bannerDetails })
        }).catch(()=>{
            res.redirect('/admin')
        })
    },

    postEditBanner: (req, res) => {
        const bannerId = req.params.id
        const bannerDetails = req.body
        bannerHelper.editBanner(bannerId, bannerDetails).then(() => {
            res.redirect('/admin/banners')
        }).catch(()=>{
            res.redirect('/admin')
        })
    },

    getDeleteBanner: (req, res) => {
        const bannerId = req.params.id
        bannerHelper.deleteBanner(bannerId).then(() => {
            res.redirect('/admin/banners')
        }).catch(() => {
            res.redirect('/admin/banners')
        })
    }






}
