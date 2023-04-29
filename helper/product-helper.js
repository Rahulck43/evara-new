const db = require('../config/connection')
const multer = require('multer');
const productModel = require('../models/product-model')
const categoryModel = require('../models/category-model');
const orderModel = require('../models/order-model');



module.exports = {


    addProduct: (product, images) => {
        return new Promise(async (resolve, reject) => {
            const newProduct = new productModel({
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                stockQuantity: product.quantity,
                image: images
            })
            newProduct.save()
            resolve()
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            const products = await productModel.find()
            if (products) {
                resolve(products)
            } else {
                reject()
            }
        })
    },

    searchProducts:(key)=>{
        return new Promise((resolve,reject)=>{
            productModel.aggregate([{
                $match:{
                    $or:[
                    {$and:[{name: { $regex: new RegExp(key, 'i') }},{isDeleted:false}]}, { category: { $regex: new RegExp(key, 'i') } }
                    ]
                }
            }]).then((products)=>{
                console.log(products);
               resolve(products)
            }).catch((error)=>{
                console.log(error)
                reject()
            })
        })
    },

    viewProduct: (proId) => {
        return new Promise((resolve, reject) => {
            const product = productModel.findOne({ _id: proId }).then((product) => {
                resolve(product)
            })
        })
    },

    userProducts: (page, query) => {

        const PAGE_SIZE = 6;
        return new Promise(async (resolve, reject) => {
            const count = await productModel.countDocuments({ isDeleted: false });
            const totalPages = Math.ceil(count / PAGE_SIZE);
            const currentPage = Math.min(Math.max(page, 1), totalPages);
            const skip = (currentPage - 1) * PAGE_SIZE;

            let queryObj = { isDeleted: false }
            if (query && query.category) {
                queryObj.category = query.category
            }
            let sortObj = {};
            if (query && query.sort) {
                if (query.sort === 'l2h') {
                    sortObj = { price: 1 };
                } else if (query.sort === 'h2l') {
                    sortObj = { price: -1 };
                }
            }

            const products = await productModel
                .find(queryObj)
                .sort(sortObj)
                .skip(skip)
                .limit(PAGE_SIZE);

            if (products) {
                resolve({
                    data: products,
                    pagination: {
                        currentPage,
                        totalPages,
                        pageSize: PAGE_SIZE,
                        totalItems: count,
                    },
                });
            } else {
                reject();
            }
        });
    },


    findProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            const productId = id
            const product = await productModel.findOne({ _id: productId })
            resolve(product)
        })
    },

    editProduct: (id, product, images) => {
        return new Promise(async (resolve, reject) => {
            if (images) {
                const myquery = { _id: id }
                const update = {
                    $set: {
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        stockQuantity: product.quantity,
                        image: images
                    },
                }
                const newProduct = await productModel.updateOne(myquery, update)
                resolve(newProduct)
            } else {
                data = await productModel.findOne({ _id: id })
                const myquery = { _id: id }
                const update = {
                    $set: {
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        stockQuantity: product.quantity
                    }
                }
                const newProduct = await productModel.updateOne(myquery, update)
                resolve(newProduct)
            }
        })
    },

    updateQuantity: (proId, quantity) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: proId }).then((product) => {
                if (product.stockQuantity == 0) {
                    product.stockQuantity = 0
                    product.save()
                    resolve()
                } else {
                    product.stockQuantity = product.stockQuantity - quantity
                    product.save()
                    resolve()
                }
            })
        })
    },

    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: id }).then((data) => {
                data.isDeleted = !data.isDeleted
                data.save()
                resolve()
            })
        })
    },

    getCategories: () => {
        return new Promise((resolve, reject) => {
            categoryModel.find().then((categories) => {
                resolve(categories)
            }).catch(() => reject())
        })
    },


    // updateOrderStatus: (orderId) => {
    //     return new Promise((resolve, reject) => {

    //         orderModel.findByIdAndUpdate(
    //             orderId,
    //             { status: 'Cancelled' }
    //         ).then((response) => {
    //             resolve(response)
    //         }).catch((error) => {
    //             console.log(error);
    //             reject()
    //         })
    //     })
    // }



}