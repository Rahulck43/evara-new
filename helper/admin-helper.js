const userModel = require('../models/user-model')
const orderModel = require('../models/order-model')
const categoryModel = require('../models/category-model')



const admin = {
    email: 'ckrahul03@gmail.com',
    password: '123456'
}
module.exports = {


    adminLogin: function (body) {
        return new Promise((resolve, reject) => {
            if (body.email == admin.email && body.password == admin.password) {
                const response = {}
                response.admin = admin
                response.status = true
                resolve(response)
            } else {

                reject()
            }
        })

    }

    , async getAllUsers() {
        try {
            const users = await userModel.find(); // find all users
            return users;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async blockUser(id) {
        const userId = id
        try {
            const user = await userModel.findOne({ _id: userId })
            user.status = !user.status
            await user.save()
            return user.status
        } catch (error) {

        }
    },

    allOrders: () => {
        return new Promise((resolve, reject) => {
            orderModel.find().then((response) => {
                resolve(response)
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

    UpdateOrderStatus: (orderId, newStatus) => {
        return new Promise((resolve, reject) => {
            orderModel.findByIdAndUpdate(
                orderId,
                { $set: { status: newStatus } },
                { new: true }
            ).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getSalesDetails: () => {
        return new Promise((resolve, reject) => {
            orderModel.aggregate([
                {
                    $group: {
                        _id: { $month: "$date" },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]).then((salesByMonth) => {
                resolve(salesByMonth);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    getYearlySalesDetails: () => {
        return new Promise((resolve, reject) => {
            orderModel.aggregate([
                {
                    $group: {
                        _id: { $year: "$date" },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]).then((salesByYear) => {

                resolve(salesByYear);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    getOrdersByDate: async () => {
        try {
            const ordersByDate = await orderModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$date" },
                            year: { $year: "$date" }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
            return ordersByDate;
        } catch (error) {
            throw new Error(error);
        }
    },

    getCategorySales: async () => {
        const orders = await orderModel.find().populate('products.id', 'category');
        const categorySales = {};
      
        orders.forEach(order => {
          order.products.forEach(product => {
            const category = product.id.category;
            if (category) {
              if (category in categorySales) {
                categorySales[category] += 1;
              } else {
                categorySales[category] = 1;
              }
            }
          });
        });
      
        const allCategories = await categoryModel.find()
        const result = allCategories.map(category => {
          const count = categorySales[category.category] || 0
          return { name: category.category, count }
        })
      
        return result;
      }
      









}

