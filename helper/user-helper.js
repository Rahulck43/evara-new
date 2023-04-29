const userModel = require('../models/user-model')
const cartModel = require('../models/cart-model')
const wishlistModel = require('../models/wishlist-model')
const orderModel = require('../models/order-model')
const productModel = require('../models/product-model')
const bcrypt = require('bcrypt');
const productHelper = require('./product-helper');
const Razorpay = require('razorpay');
const PDFDocument = require('pdfkit')
const fs = require('fs')
const doc = new PDFDocument()
// const { response } = require('../app');

const accountSid = "ACeadacbfa8e1a0e1577c5179567e2900a";
const authToken = "a17e9fecdbe6d9f135ccbd68fd2f88d5"
const verifySid = "VA7eb41b134321e4a1ba175e05c15f6074";
const client = require("twilio")(accountSid, authToken);


var instance = new Razorpay({
    key_id: 'rzp_test_FjQy8eJvplPGuD',
    key_secret: 'jKfz9cSfx5pjROXgagrJGEAF',
});


module.exports = {
    getHomeProducts:()=>{
        console.log('calling');
        return new Promise((resolve,reject)=>{
            productModel.aggregate([
                { $match: { isDeleted: false } },
                { $sample: { size: 4 } }
              ]).then((result)=>{
                console.log(result);
                resolve(result)
            }).catch((error)=>{
                console.log(error);
                reject()
            })
        })
    },

    createANewUser: function (body) {
        return new Promise(async (resolve, reject) => {
            const emailExist = await userModel.findOne({ email: body.email })
            const numberExist = await userModel.findOne({ mobileNo: body.mobileNo })
            if (emailExist || numberExist) {
                reject()
            } else {
                body.password = await bcrypt.hash(body.password2, 10)
                const newUserDbDocument = new userModel({
                    name: body.name,
                    mobileNo: body.mobileNo,
                    password: body.password,
                    email: body.email
                })
                newUserDbDocument.save().then((newUserDbDocument) => {
                    const response = {}
                    response.user = newUserDbDocument
                    response.status = true
                    resolve(response)
                })
            }
        })
    },

    userLogin: function (body) {
        return new Promise(async (resolve, reject) => {
            const user = await userModel.findOne({ email: body.email })
            if (!user || user.status == false) {
                reject()
            } else {
                bcrypt.compare(body.password, user.password).then((status) => {
                    if (status) {
                        let response = {}
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        reject()
                    }

                })
            }
        })
    },

    getOtp: function (mob) {
        return new Promise((resolve, reject) => {
            userModel.findOne({ mobileNo: mob }).then((response) => {
                if (!response) {
                    reject()
                } else {
                    client.verify.v2
                        .services(verifySid)
                        .verifications.create({ to: `+91${mob}`, channel: "sms" })
                        .then((verification) => console.log(verification.status))

                    resolve()
                }
            })
        })
    },
    verifyOtp: function (mob, otp) {
        return new Promise((resolve, reject) => {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${mob}`, code: otp })
                .then((response) => {
                    const status = response.valid
                    userModel.findOne({ mobileNo: mob }).then((user) => {
                        resolve({ user, status })
                    })
                }).catch((error) => {
                    console.log(error)
                    reject()
                })
        })
    },

    getCartCount: function (userId) {
        return new Promise((resolve, reject) => {
            cartModel.findOne({ id: userId }).then((cart) => {
                if (cart) {
                    let count = cart.products.length
                    resolve(count)
                } else {
                    count = 0
                    resolve(count)
                }
            }).catch((error) => {
                console.log(error)
                reject()
            })
        })

    },

    getWishlistCount: function (userId) {
        return new Promise((resolve, reject) => {
            wishlistModel.findOne({ id: userId }).then((wishlist) => {
                if (wishlist) {
                    let count = wishlist.products.length
                    resolve(count)
                } else {
                    count = 0
                    resolve(count)
                }
            }).catch((error) => {
                console.log(error)
                reject()
            })
        })
    },

    getCartProducts: function (userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const cart = await cartModel.findOne({ id: userId });
                if (cart) {
                    if (cart.products.length === 0) {
                        reject({ error: 'Your cart is Empty' })
                    }
                    const productIds = cart.products.map(product => product.item);
                    const products = await productModel.find({ _id: { $in: productIds } });
                    const cartDetails = cart.products.map(product => {
                        const productDetails = products.find(prod => prod._id == product.item);
                        return { ...productDetails.toObject(), quantity: product.quantity, totalAmount: product.quantity * productDetails.price };
                    });
                    resolve(cartDetails);
                } else {
                    reject({ error: 'Your cart is Empty' })
                }
            } catch (err) {
                reject({ error: 'something went wrong' })
            }
        })
    },

    getWishlistProducts: function (userId) {
        return new Promise((resolve, reject) => {
            wishlistModel.findOne({ id: userId }).populate('products').exec().then((wishlist) => {
                if (!wishlist) {
                    resolve([]);
                } else {
                    resolve(wishlist.products);
                }
            }).catch((err) => {
                reject(err);
            })
        })
    },


    calculateSubtotal: function (products) {
        let subtotal = 0;
        products.forEach((product) => {
            subtotal += product.price * product.quantity;
        });
        return subtotal;
    },


    addToCart: function (userId, productId, qty) {
        let proObj = {
            item: productId,
            quantity: qty
        }
        return new Promise(async (resolve, reject) => {
            const product = await productModel.findOne({ _id: productId })
            await productHelper.updateQuantity(productId, qty)
            if (product.stockQuantity == 0) {
                reject()
            } else {
                let cart = await cartModel.findOne({ id: userId })
                if (cart) {
                    const proExist = cart.products.findIndex(product => product.item == productId)
                    console.log(proExist);
                    if (proExist != -1) {
                        await cartModel.findOneAndUpdate(
                            { id: userId, 'products.item': productId },
                            { $inc: { 'products.$.quantity': qty } },
                            { new: true }
                        )
                        resolve()
                    } else {
                        await cartModel.findOneAndUpdate(
                            { id: userId },
                            { $push: { products: proObj } },
                            { new: true }
                        )
                        resolve()
                    }
                } else {
                    cart = new cartModel({
                        id: userId,
                        products: [proObj]
                    })
                    await cart.save()
                    resolve()
                }
            }
        })
    },

    changeProductQuantity: function (details) {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                cartModel.updateOne(
                    { id: details.cart },
                    { $pull: { products: { item: details.product } } }
                ).then(() => {
                    resolve({ removeProduct: true })
                })
            } else {
                cartModel.updateOne(
                    { id: details.cart, 'products.item': details.product },
                    { $inc: { 'products.$.quantity': details.count } }
                ).then((response) => {
                    resolve({ status: true })
                })
            }
        })
    },

    removeCart: function (userId, ProductId) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await cartModel.updateOne(
                    { id: userId },
                    { $pull: { products: { item: ProductId } } }
                )
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },

    removeFromWishlist: function (userId, productId) {
        console.log(userId)
        console.log(productId)
        return new Promise((resolve, reject) => {
            wishlistModel.updateOne(
                { id: userId },
                { $pull: { products: productId } },
                { new: true }
            ).then((wishlist) => {
                console.log(wishlist);
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    clearCart: function (userId) {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ id: userId }, { $unset: { products: 1 } }).then((cart) => {
                if (!cart) {
                    reject()
                } else {
                    resolve(cart)
                }
            }).catch((err) => {
                reject({ error: 'something went wrong' })
            })
        })
    },

    getTotalAmount: function (userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const cart = await cartModel.findOne({ id: userId });
                if (cart) {
                    const productIds = cart.products.map(product => product.item);
                    const products = await productModel.find({ _id: { $in: productIds } });
                    const cartDetails = cart.products.map(product => {
                        const productDetails = products.find(prod => prod._id == product.item);
                        return { ...productDetails.toObject(), quantity: product.quantity, totalAmount: product.quantity * productDetails.price };
                    });
                    const subtotal = cartDetails.reduce((acc, curr) => acc + curr.totalAmount, 0);

                    resolve(subtotal);
                } else {
                    reject({ error: 'cart not found' })
                }
            } catch (err) {
                reject({ error: 'something went wrong' })
            }
        })
    },

    findAdress: (userId) => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ _id: userId }).then((user) => {
                const addresses = user.addresses
                if (addresses) {
                    resolve(addresses)
                } else {
                    resolve()
                }
            }).catch(() => {
                reject()
            })
        })
    },

    placeOrder: function (cartDetails, orderDetails, userId) {
        const finalPrice = orderDetails.finalPrice
        return new Promise((resolve, reject) => {

            let status = orderDetails.payment_option === 'COD' || orderDetails.payment_option === 'wallet' ? 'Order Placed' : 'Pending';
            let orderProducts = [];
            let totalAmount = 0
            for (let i = 0; i < cartDetails.length; i++) {
                let cartItem = cartDetails[i];
                let orderProduct = {
                    id: cartItem._id,
                    quantity: cartItem.quantity
                };
                orderProducts.push(orderProduct);
                totalAmount += cartItem.totalAmount
                // productHelper.updateQuantity(cartItem._id, cartItem.quantity)
            }
            if (finalPrice) totalAmount = finalPrice
            let order = new orderModel({
                id: userId,
                name: orderDetails.name,
                billing_address: orderDetails.address,
                city: orderDetails.city,
                district: orderDetails.district,
                state: orderDetails.state,
                zipcode: orderDetails.zipcode,
                phone: orderDetails.phone,
                payment_option: orderDetails.payment_option,
                products: orderProducts,
                status: status,
                date: new Date(),
                totalAmount: totalAmount,
                couponCode: orderDetails.couponCode
            });
            order.save().then((savedOrder) => {
                resolve(savedOrder)
            })
                .catch(error => reject(error));
        })
    },

    generateRazorpay: (Order) => {  //(Order case sensitive here)
        console.log(Order);
        return new Promise((resolve, reject) => {
            var options = {
                amount: Order.totalAmount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: Order._id.toString()
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(order)
                }
            })

        })

    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'jKfz9cSfx5pjROXgagrJGEAF')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    changePaymentStatus: (orderId) => {
        console.log(orderId + 'changestatus');
        return new Promise((resolve, reject) => {
            orderModel.findByIdAndUpdate(orderId,
                { $set: { status: 'Order Placed' } }
            ).then(() => {
                resolve()
            })
        })
    },

    myOrders: (userId) => {
        return new Promise((resolve, reject) => {
            orderModel.find({ id: userId }).then((response) => {
                resolve(response)
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },

    singleOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            orderModel.findById(orderId).populate('products.id').exec().then((order) => {
                const products = order.products.map(product => {
                    return {
                        id: product.id._id,
                        name: product.id.name,
                        description: product.id.description,
                        category: product.id.category,
                        price: product.id.price,
                        quantity: product.quantity,
                        images: product.id.image
                    }
                });
                const orderDetails = {
                    id: order._id,
                    name: order.name,
                    billingAddress: order.billing_address,
                    city: order.city,
                    district: order.district,
                    state: order.state,
                    zipcode: order.zipcode,
                    phone: order.phone,
                    paymentOption: order.payment_option,
                    status: order.status,
                    products: products,
                    date: order.date,
                    totalAmount: order.totalAmount
                }

                resolve(orderDetails)
            }).catch((err) => {
                reject(err)
            })
        });
    },

    generateInvoice: (orderDetails) => {
        console.log(orderDetails);
        return new Promise((resolve, reject) => {
            const { id, name, billingAddress, city, district, state, zipcode, phone, paymentOption, status, products, date, totalAmount } = orderDetails;

            formattedDate = date.toLocaleDateString('en-GB')

            doc.font('Times-Roman').fontSize(18).text('INVOICE', { align: 'center' });
            doc.fontSize(15).text('Shipping Address', 50, 150)
            doc.fontSize(12).text(`Name: ${name}`, 50, 180)
                .text(`Office/House No.: ${billingAddress}`)
                .text(`City: ${city}`)
                .text(`District: ${district}`)
                .text(`State: ${state}`)
                .text(`Zipcode: ${zipcode}`)
                .text(`Phone: ${phone}`)

            doc.fontSize(15).text('Order Details', 345, 150)
            doc.fontSize(12).text(`Invoice No: ${id}`, 345, 180)
                .text(`Purchase Date: ${formattedDate}`)
                .text(`Total Amount: ${totalAmount}`)
                .text(`Payment Mode: ${paymentOption}`)
            doc.moveTo(30, 300).lineTo(580, 300).stroke();
            doc.moveTo(30, 140).lineTo(580, 140).stroke();
            doc.moveTo(30, 170).lineTo(580, 170).stroke();


            doc.fontSize(15).text('No.', 50, 340)
                .text('Name', 100, 340)
                .text('Quantity', 350, 340)
                .text('Unit Price', 450, 340)
                .text('Amount', 550, 340)

            let y = 370;
            products.forEach(({ name, price, quantity }, index) => {
                y += 30;
                doc.fontSize(12)
                    .text(`${index + 1}`, 50, y)
                    .text(name, 100, y)
                    .text(quantity, 350, y)
                    .text(price, 450, y)
                    .text(price * quantity, 550, y)
            })
            doc.fontSize(16).text('Subtotal', 400, y + 50)
            doc.fontSize(18).text(`${totalAmount}`, 550, y + 50)

            const stream = doc.pipe(fs.createWriteStream('invoice.pdf'));
            stream.on('finish', () => {
                console.log('PDF created');
                resolve();
            });
            doc.end();
        });
    },



    returnOrder: (orderId, userId) => {
        return new Promise((resolve, reject) => {
            orderModel.findByIdAndUpdate(
                orderId,
                { $set: { status: 'Returned' } },
                { new: true }
            ).then((response) => {
                const amount = response.totalAmount
                userModel.findByIdAndUpdate(userId,
                    {
                        $inc: { wallet: amount }
                    }).then((response) => {
                        console.log(response);
                        resolve()
                    })

                resolve()
            }).catch((err) => {
                console.log(err);
                reject()
            })
        })
    },

    cancelOrder: (orderId, userId) => {
        return new Promise((resolve, reject) => {
            orderModel.findByIdAndUpdate(
                orderId,
                { $set: { status: 'Cancelled' } },
                { new: true }
            ).then((response) => {
                const amount = response.totalAmount
                if(response.payment_option==='razorPay'){
                userModel.findByIdAndUpdate(userId,
                    {
                        $inc: { wallet: amount }
                    }).then((response) => {
                        console.log(response);
                        resolve()
                    })
                }else{
                    resolve()
                }
            }).catch((err) => {
                console.log(err);
                reject()
            })
        })
    },



    addToWishlist: function (userId, productId) {
        return new Promise(async (resolve, reject) => {
            let wishlist = await wishlistModel.findOne({ id: userId })
            if (wishlist) {
                await wishlistModel.findOneAndUpdate(
                    { id: userId },
                    { $addToSet: { products: productId } },
                    { new: true }
                )
                resolve()
            } else {
                wishlist = new wishlistModel({
                    id: userId,
                    products: [productId]
                })
                await wishlist.save()
                resolve()
            }
        })
    },

    getWalletAmount: (usesrId) => {
        return new Promise((resolve, reject) => {
            userModel.findById(usesrId).then((user) => {
                resolve(user.wallet)
            }).catch(() => {
                reject()
            })
        })
    },

    updateWallet: (userId, amount) => {
        console.log(amount);
        return new Promise((resolve, reject) => {
            userModel.updateOne(
                { _id: userId },
                { $inc: { wallet: -amount } }
            ).then((result) => {
                resolve()
            }).catch((error) => {
                console.log(error);
                reject()
            })
        })
    },

    getAddresses: (userId) => {
        return new Promise((resolve, reject) => {
            userModel.findById(userId).then((user) => {
                const allAddresses = user.addresses
                if (allAddresses) {
                    resolve(allAddresses)
                } else {
                    reject()
                }
            }).catch((error) => {
                console.log(error);
                reject()
            })
        })
    },

    addAddress: (user, address) => {
        const userId = user._id
        return new Promise((resolve, reject) => {
            userModel.findByIdAndUpdate(userId,
                {
                    $push: { addresses: address }
                }
            ).then(() => {
                resolve()
            }).catch(() => {
                reject
            })
        })
    },

    editAddress: (userId, addressToUpdate, newAddress) => {
        return new Promise((resolve, reject) => {
            userModel.findById(userId).then((userData) => {
                const index = userData.addresses.findIndex(address => {
                    return (
                        address.name === addressToUpdate.name &&
                        address.address === addressToUpdate.address &&
                        address.city === addressToUpdate.city &&
                        address.district === addressToUpdate.district &&
                        address.state === addressToUpdate.state &&
                        address.zipcode === addressToUpdate.zipcode &&
                        address.phone === addressToUpdate.phone
                    );
                })
                userData.addresses[index] = {
                    name: newAddress.name,
                    address: newAddress.address,
                    city: newAddress.city,
                    district: newAddress.district,
                    state: newAddress.state,
                    zipcode: newAddress.zipcode,
                    phone: newAddress.phone
                }
                userData.save().then((updatedUserData) => {
                    resolve(updatedUserData)
                })
            }).catch(() => {
                reject()
            })
        })
    },

    removeAddress: (userId, rAddress) => {
        return new Promise((resolve, reject) => {
            userModel.findById(userId).then((userData) => {
                const index = userData.addresses.findIndex(address => {
                    return (
                        address.name === rAddress.name &&
                        address.address === rAddress.address &&
                        address.city === rAddress.city &&
                        address.district === rAddress.district &&
                        address.state === rAddress.state &&
                        address.zipcode === rAddress.zipcode &&
                        address.phone === rAddress.phone
                    )
                })
                userData.addresses.splice(index, 1) // Remove 1 element at index
                userData.save().then((updatedUserData) => {
                    resolve(updatedUserData);
                })
            })
        })
    }





}













