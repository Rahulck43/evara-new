var express = require('express');
const userHelper = require('../helper/user-helper');
const productHelper = require('../helper/product-helper')
const couponHelper = require('../helper/coupon-helper')
const bannerHelper = require('../helper/bannerHelper')
const session = require('express-session');


module.exports = {
    getCategories: (req, res, next) => {
        productHelper.getCategories().then((categories) => {
            res.locals.categories = categories
        })
        next()
    },

    getHome: async (req, res) => {
        const user = req.session.user
        try {
            const banners = await bannerHelper.getAllBanners()
            const products = await userHelper.getHomeProducts()
            if (user) {
                const count = await userHelper.getCartCount(user._id)
                const wcount = await userHelper.getWishlistCount(user._id)
                res.render('user/index', { user, count, wcount, banners, products })
            } else {
                res.render('user/index', { user, banners, products })
            }
        } catch {
            res.redirect('/')
        }
    },

    // ***************************************************LOGIN*************************************************
    getLogin: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('user/login')
        }
    },

    getOtpLogin: (req, res) => {
        res.render('user/otp')
    },

    postOtpLogin: (req, res) => {
        req.session.number = req.body.mobileNo
        userHelper.getOtp(req.body.mobileNo).then((resolve) => {
            res.render('user/enterOtp')
        }).catch(() => {
            const error = 'mobile number not registered '
            res.render('user/otp', { error })
        })
    },

    otpSubmit: (req, res) => {
        const number = req.session.number
        const otp = req.body.otp
        userHelper.verifyOtp(number, otp).then((response) => {
            console.log(response);
            if (response.status == true) {
                req.session.user = response.user
                res.redirect('/')
            } else {
                const error = 'invalid OTP....!!!'
                res.render('user/enterOtp', { error })
            }
        }).catch(() => {
            const error = 'invalid OTP....!!!'
            res.render('user/enterOtp', { error })
        })
    },

    postLogin: (req, res) => {
        userHelper.userLogin(req.body).then((resolve) => {
            req.session.user = resolve.user
            res.redirect('/')
        }).catch(() => {
            const invalid = 'incorrect username or password....!!!!'
            res.render('user/login', { invalid })
        })
    },

    postSignup: (req, res) => {
        userHelper.createANewUser(req.body).then((resolve) => {
            req.session.user = resolve.user
            res.redirect('/')
        }).catch(() => {
            const exist = 'User already registered'
            res.render('user/login', { exist })
        })
    },

    getLogout: (req, res) => {
        req.session.user = null
        res.redirect('/')
    },


    // ******************************************************  CART  *******************************************
    getShop: (req, res) => {
        let query = {}
        const user = req.session.user
        const page = req.query.page ? req.query.page : 1
        query.category = req.query.category
        query.sort = req.query.sort
        productHelper.userProducts(page, query).then((result) => {
            const products = result.data
            const pagination = result.pagination
            productHelper.getCategories().then((categories) => {
                if (user) {
                    userHelper.getCartCount(user._id).then((count) => {
                        userHelper.getWishlistCount(user._id).then((wcount) => {
                            res.render('user/shop', { user, products, pagination, count, wcount, categories })
                        })
                    })
                } else {
                    res.render('user/shop', { user, products, pagination, categories })
                }
            })
        }).catch(() => {
            res.redirect('/')
        })
    },

    getSearchProducts: (req, res) => {
        const search = req.params.key
        productHelper.searchProducts(search).then((data) => {
            res.json(data)
        })
    },

    getProductPage: (req, res) => {
        const user = req.session.user
        const proId = req.params.id
        productHelper.findProduct(proId).then((product) => {
            if (user) {
                userHelper.getCartCount(user._id).then((count) => {
                    userHelper.getWishlistCount(user._id).then((wcount) => {
                        res.render('user/product', { user, product, count, wcount })
                    })
                })
            } else {
                res.render('user/product', { user, product })
            }
        }).catch(() => {
            res.redirect('/')
        })
    },

    getCartPage: (req, res) => {
        const user = req.session.user
        userHelper.getCartProducts(user._id).then((products) => {
            const subtotal = userHelper.calculateSubtotal(products)
            userHelper.getCartCount(user._id).then((count) => {
                userHelper.getWishlistCount(user._id).then((wcount) => {
                    res.render('user/cart', { user, products, subtotal, count, wcount })
                })
            })
        }).catch((error) => {
            res.render('user/cart', { user, error })
        })
    },

    addToCart: (req, res) => {
        let qty = req.query.qty || 1
        const productId = req.params.id
        userHelper.addToCart(req.session.user._id, productId, qty).then(() => {
            userHelper.getCartCount(req.session.user._id).then((count) => {
                res.json({ status: true, count: count })
            })
        }).catch(() => {
            res.redirect('/shop')
        })
    },

    postChangeProductQuantity: (req, res) => {
        userHelper.changeProductQuantity(req.body).then(async (response) => {
            const productTotal = await userHelper.getTotalAmount(req.body.cart)
            response.total = productTotal
            res.json(response)
        })
    },

    removeFromCart: (req, res) => {
        const productId = req.params.id
        const userId = req.session.user._id
        userHelper.removeCart(userId, productId).then(() => {
            res.redirect('/cart')
        }).catch(() => {
            res.redirect('/')
        })
    },

    removeFromWishlist: (req, res) => {
        const productId = req.params.id
        const userId = req.session.user._id
        userHelper.removeFromWishlist(userId, productId).then(() => {
            res.redirect('/wishlist')
        }).catch(() => {
            res.redirect('/')
        })
    },

    getClearCart: (req, res) => {
        const userId = req.session.user._id
        userHelper.clearCart(userId).then(() => {
            res.redirect('/cart')
        }).catch((err) => {
            res.redirect('/shop')
        })
    },


    getCheckout: async (req, res) => {
        const error = req.query.error
        const user = req.session.user
        const addresses = await userHelper.findAdress(user._id)
        const products = await userHelper.getCartProducts(user._id)
        const subtotal = userHelper.calculateSubtotal(products)
        userHelper.getCartCount(user._id).then((count) => {
            userHelper.getWishlistCount(user._id).then((wcount) => {
                couponHelper.getAllCoupons().then((coupons) => {
                    res.render('user/checkout', { user, products, subtotal, count, wcount, addresses, coupons, error })
                })
            }).catch((error) => {
                res.redirect('/cart')
            })
        }).catch((error) => {
            res.redirect('/shop')
        })
    },

    postCheckout: (req, res) => {
        const user = req.session.user
        const userId = user._id
        const orderDetails = req.body
        userHelper.getCartProducts(userId).then((cartDetails) => {
            return userHelper.placeOrder(cartDetails, orderDetails, userId)
        }).then((order) => {
            if (orderDetails.payment_option === 'COD') {
                userHelper.clearCart(userId)
                res.json({ cod: true })
            } else if (orderDetails.payment_option === 'wallet') {
                userHelper.clearCart(userId)
                res.json({ wallet: true })
            } else if (orderDetails.payment_option === 'razorPay') {
                userHelper.generateRazorpay(order).then((razor) => {
                    userHelper.clearCart(userId).then(() => {
                        res.json({ razor, razorPay: true })
                    })
                })
            }
        }).catch((err) => {
            res.redirect('/cart')
        })
    },

    orderPlaced: (req, res) => {
        const user = req.session.user
        const wallet = req.query.order
        const amount = req.query.amount
        if (wallet) {
            userHelper.updateWallet(user._id, amount).then(() => {
                res.render('user/order-placed', { user })
            }).catch(() => {
                res.render('user/order-placed', { user })
            })
        } else {
            res.render('user/order-placed', { user })
        }
    },

    postVerifyPayment: (req, res) => {
        console.log(req.body)
        userHelper.verifyPayment(req.body).then(() => {
            userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
                res.json({ status: true })
            })
        }).catch(() => {
            res.json({ status: false, error: '' })
        })
    },

    paymentFailed: (req, res) => {
        res.render('user/payment-failed', { user })
    },


    // ******************************************************ORDERS********************************************
    getMyOrders: (req, res) => {
        const user = req.session.user
        const userId = user._id
        try {
            userHelper.myOrders(userId).then((orders) => {
                userHelper.getCartCount(user._id).then((count) => {
                    userHelper.getWishlistCount(user._id).then((wcount) => {
                        res.render('user/my-orders', { user, orders, count, wcount })
                    })
                })
            })
        } catch {
            res.redirect('/')
        }
    },

    getSingleOrder: (req, res) => {
        const user = req.session.user
        const orderId = req.params.id
        try {
            userHelper.singleOrder(orderId).then((orderDetails) => {
                userHelper.getCartCount(user._id).then((count) => {
                    res.render('user/single-order', { user, orderDetails, count })
                })
            })
        } catch {
            res.redirect('/')
        }
    },

    getInvoice: (req, res) => {
        const orderId = req.params.id
        userHelper.singleOrder(orderId).then((orderDetails) => {
            console.log(orderDetails);
            userHelper.generateInvoice(orderDetails).then(() => {
                res.download('invoice.pdf')
            }).catch((err) => {
                console.log('Error creating invoice PDF:', err);
            })
        })
    },

    getRetunOrder: (req, res) => {
        const userId = req.session.user._id
        const orderId = req.params.id
        userHelper.returnOrder(orderId, userId).then(() => {
            res.redirect('/my-orders')
        }).catch(() => {
            res.redirect('/checkout')
        })
    },

    getCancelOrder: (req, res) => {
        const userId = req.session.user._id
        const orderId = req.params.id
        userHelper.cancelOrder(orderId, userId).then(() => {
            res.redirect('/my-orders')
        }).catch(() => {
            res.redirect('/checkout')
        })
    },

    postCouponValidate: async (req, res) => {
        const user = req.session.user
        const subtotal = req.query.subtotal
        const couponCode = req.body.couponCode
        couponHelper.couponValidate(couponCode, subtotal, user).then((finalPrice) => {
            userHelper.findAdress(user._id).then((addresses) => {
                userHelper.getCartProducts(user._id).then((products) => {
                    userHelper.getCartCount(user._id).then((count) => {
                        userHelper.getWishlistCount(user._id).then((wcount) => {
                            couponHelper.getCoupon(couponCode).then((coupon) => {
                                const price = {}
                                price.subtotal = subtotal
                                price.finalPrice = finalPrice
                                price.discount = subtotal - finalPrice
                                price.couponCode = couponCode
                                price.success = 'Coupon Applied Successfully....!!!'
                                res.render('user/checkout', { user, products, addresses, coupon, subtotal, count, wcount, price })

                            }).catch((error) => {
                                res.redirect('/checkout');
                            })
                        })
                    }).catch((error) => {
                        res.redirect('/checkout');
                    })
                }).catch((error) => {
                    res.redirect('/checkout');
                })
            }).catch((error) => {
                res.redirect('/checkout');
            })
        }).catch((error) => {
            req.flash('error', error.message);
            res.redirect('/checkout');
        })
    },

    getRemoveCoupon: (req, res) => {
        req.flash('error', 'Coupon removed...!!!');
        res.redirect('/checkout')
    },


    // ******************************************************MY ACCOUNT********************************************

    getMyAccount: async (req, res) => {
        const user = req.session.user
        try {
            const count = await userHelper.getCartCount(user._id)
            const wcount = await userHelper.getWishlistCount(user._id)
            const wallet = await userHelper.getWalletAmount(user._id)
            const addresses = await userHelper.getAddresses(user._id)
            res.render('user/my-account', { user, count, wcount, wallet, addresses })
        } catch {
            res.redirect('/')
        }
    },


    // *********************************WISHLIST********************************************
    addToWishlist: (req, res) => {
        const productId = req.params.id
        userHelper.addToWishlist(req.session.user._id, productId).then(() => {
            userHelper.getWishlistCount(req.session.user._id).then((wcount) => {
                res.json({ status: true, wcount: wcount })
            })
        }).catch(() => {
            res.redirect('/shop')
        })
    },

    getWishlistPage: (req, res) => {
        const user = req.session.user
        userHelper.getWishlistProducts(user._id).then((products) => {
            userHelper.getWishlistCount(user._id).then((wcount) => {
                userHelper.getCartCount(user._id).then((count) => {
                    res.render('user/wishlist', { user, products, count, wcount })
                }).catch(() => {
                    res.redirect('/shop')
                })
            }).catch(() => {
                res.redirect('/shop')
            })
        }).catch(() => {
            res.redirect('/shop')
        })
    },

    getAddAddress: (req, res) => {
        const user = req.session.user
        userHelper.getWishlistCount(user._id).then((wcount) => {
            userHelper.getCartCount(user._id).then((count) => {
                res.render('user/add-address', { user, count, wcount })
            })
        })
    },

    postAddAddress: (req, res) => {
        const user = req.session.user
        userHelper.addAddress(user, req.body).then(() => {
            res.redirect('/my-account')
        }).catch(() => {
            res.redirect('/')
        })
    },

    getEditAddress: (req, res) => {
        const user = req.session.user
        const address = JSON.parse(req.query.address);
        userHelper.getWishlistCount(user._id).then((wcount) => {
            userHelper.getCartCount(user._id).then((count) => {
                res.render('user/edit-address', { user, count, wcount, address })
            }).catch(() => {
                res.redirect('/')
            })
        }).catch(() => {
            res.redirect('/')
        })
    },

    postEditAddress: (req, res) => {
        const user = req.session.user
        const address = JSON.parse(req.query.address);
        const newAddress = req.body
        userHelper.editAddress(user._id, address, newAddress).then((updatedUser) => {
            res.redirect('/my-account')
        }).catch(() => {
            res.redirect('/my-account')
        })
    },

    getRemoveAddress: (req, res) => {
        const user = req.session.user
        const address = JSON.parse(req.query.address);
        userHelper.removeAddress(user._id, address).then(() => {
            res.redirect('/my-account')
        }).catch(()=>{
            res.redirect('/my-account')
        })
    }











    // getRemoveCoupon: (req,res)=>{
    //     const couponCode=req.params.id
    //     const userId= req.session.user._id
    //     couponHelper.removeCoupon(couponCode,userId).then(()=>{
    //         req.flash('success', 'Coupon Removed...!!!');
    //         res.redirect('/checkout')
    //     }).catch((error)=>{
    //         console.log(error);
    //         res.redirect('/checkout')
    //     })
    // }


}

