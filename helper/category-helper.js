const categoryModel = require('../models/category-model')
const productModel = require('../models/product-model')

module.exports = {

    addCategory: function (data) {
        return new Promise((resolve, reject) => {
            categoryModel.findOne({ category: data }).then((catExist) => {
                if (catExist) {
                    reject()
                } else {
                    const category = new categoryModel({
                        category: data
                    })
                    category.save().then(resolve()).catch(reject())
                }
            })
        })
    },

    getAllCategory: function () {
        return new Promise( (resolve, reject) => {
            categoryModel.find().then((category)=>{
                resolve(category)
            }).catch(()=>{
                reject()
            })
        })
    },

    getCategory: function (id) {
        return new Promise( (resolve, reject) => {
            categoryModel.findOne({ _id: id }).then((category)=>{
                resolve(category)
            }).catch(()=>{
                reject()
            })
        })
    },

    editCategory: function (id, newCategory) {
        return new Promise((resolve, reject) => {
            categoryModel.updateOne({ _id: id }, { category: newCategory }).then((response) => {
                resolve()
            }).catch(()=>{
                reject()
            })
        })
    },

    editCategoryProducts: (categoryName, oldCategoryName) => {
        return new Promise((resolve, reject) => {
            productModel.updateMany({
                category: oldCategoryName
            },
                { $set: { category: categoryName } }
            ).then((result) => {
                resolve()
            }).catch((error) => {
                reject()
            })
        })
    },

    toggleCat: (id) => {
        return new Promise((resolve, reject) => {
            categoryModel.findOne({ _id: id }).then((cat) => {
                const thisCategory = cat
                if (!thisCategory) {
                    reject(new Error('Category not found.'))
                } else {
                    productModel.find({ category: thisCategory.category }).then((products) => {
                        console.log(products);
                        if (products.length > 0) {
                            reject(new Error('Cannot toggle category status as there are products associated with this category.'))
                        } else {
                            thisCategory.status = !thisCategory.status
                            thisCategory.save().then(() => {
                                resolve()
                            }).catch((err) => {
                                reject(err)
                            })
                        }
                    }).catch((err) => {
                        reject(err)
                    })
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }








}
