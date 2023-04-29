const userModel = require('../models/user-model')
const orderModel = require('../models/order-model')
const couponModel = require('../models/coupon-model')


module.exports = {

    addCoupon: (couponDetails) => {
        return new Promise((resolve, reject) => {
            if (!couponDetails) {
                return reject(new Error('couponDetails is required'));
            }
            new couponModel({
                couponName: couponDetails.couponName,
                couponCode: couponDetails.couponCode,
                validity: couponDetails.validity,
                minPurchase: couponDetails.minAmount,
                discount: couponDetails.discount,
                maxDiscount: couponDetails.maxDiscount,
                description: couponDetails.description
            }).save().then((newCoupon) => {
                resolve(newCoupon)
            }).catch((error) => {
                console.error('Error saving coupon:', error)
                reject(error);
            })
        })
    },

    getAllCoupons: () => {
        return new Promise((resolve, reject) => {
            couponModel.find().then((coupons) => {
                resolve(coupons)
            }).catch((error) => {
                console.error('error finding coupons:', error)
                reject(error)
            })
        })
    },

    findCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            couponModel.findById(couponId)
                .then((coupon) => {
                    resolve(coupon)
                }).catch((error) => {
                    console.error('cannot find the coupon', error)
                    reject()
                })
        })
    },

    getCoupon: (code) =>{
        return new Promise((resolve,reject)=>{
            couponModel.findOne({couponCode:code}).then((coupon)=>{
                resolve(coupon)
            }).catch((error)=>{
                console.log('error getting coupon',error);
                reject()
            })
        })
    },

    editCoupon: (couponId, coupon) => {
        return new Promise((resolve, reject) => {
            couponModel.findByIdAndUpdate(couponId,
                {
                    $set: {
                        couponName: coupon.couponName,
                        couponCode: coupon.couponCode,
                        validity: coupon.validity,
                        minPurchase: coupon.minAmount,
                        discount: coupon.discount,
                        maxDiscount: coupon.maxDiscount,
                        description: coupon.description,
                        isActive: coupon.couponStatus,
                    }
                }
            ).then(() => {
                resolve()
            }).catch((error) => {
                console.error('couldnt update.......!!!!', error)
                reject(error)
            })
        })
    },

    couponValidate: (couponcode, total, user) => {
        console.log(couponcode);
        return new Promise((resolve, reject) => {
            couponModel.findOne({ couponCode: couponcode }).then((coupon) => {
                orderModel.findOne({ id: user._id, couponCode: couponcode })
                    .then((exist) => {
                        if (exist) {
                            const errorMessage = 'You already Used This Coupon';
                            return reject(new Error(errorMessage));
                        }
                    })
                if (coupon.minPurchase > total) {
                    const errorMessage = 'Minimum Order Amount Should be ' + coupon.minPurchase
                    return reject(new Error(errorMessage))
                } if (!coupon.isActive) {
                    const errorMessage = 'This Coupon is Currently not available '
                    return reject(new Error(errorMessage))
                } if (coupon.validity < new Date) {
                    const errorMessage = 'This Coupon has been expired...!!! '
                    return reject(new Error(errorMessage))
                } else {
                    couponModel.findByIdAndUpdate(
                        coupon._id,
                        { $addToSet: { users: user._id } },
                        { new: true }
                    ).then((response) => {
                        const finalPrice = module.exports.findCouponPrice(total, coupon)
                        resolve(finalPrice)
                    }).catch((err) => {
                        const finalPrice = module.exports.findCouponPrice(total, coupon)
                        resolve(finalPrice)
                    })
                }
            }).catch((error) => {
                console.error('invalid coupon code', error)
                reject('invalid coupon code')
            })
        })
    },

    findCouponPrice: (total, coupon) => {
        console.log(total + '*********************total');
        console.log(coupon + '****************coupon');
        const discount = coupon.discount
        const maxCap = coupon.maxDiscount
        const offer = (discount * total) / 100
        if (offer >= maxCap) {
            let finalPrice = total - maxCap
            return finalPrice
        } else {
            let finalPrice = total - offer
            return finalPrice
        }
    },

    





}

