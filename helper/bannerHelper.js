const bannerModel = require('../models/banner-model')

module.exports = {

    addBanner: (bannerDetails) => {
        return new Promise((resolve, reject) => {
            const banner = new bannerModel({
                name: bannerDetails.name,
                header1: bannerDetails.header1,
                header2: bannerDetails.header2,
                description: bannerDetails.description,
                image: bannerDetails.image,
                status: true,
                link: bannerDetails.link
            })
            banner.save().then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getAllBanners: () => {
        return new Promise((resolve, reject) => {
            bannerModel.find().then((allBanners) => {
                if (allBanners) {
                    resolve(allBanners)
                } else {
                    reject()
                }
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },

    findBanner: (banner) => {
        return new Promise((resolve, reject) => {
            bannerModel.findById(banner).then((bannerDetails) => {
                if (bannerDetails) {
                    resolve(bannerDetails)
                } else {
                    reject()
                }
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },

    editBanner: (bannerId, bannerDetails) => {
        return new Promise((resolve, reject) => {
            const updateFields={
                name: bannerDetails.name,
                header1: bannerDetails.header1,
                header2: bannerDetails.header2,
                description: bannerDetails.description,
                status: bannerDetails.status,
                link: bannerDetails.link
            }
            if(bannerDetails.image){
                updateFields.image= bannerDetails.image
            }
            bannerModel.findByIdAndUpdate( bannerId, updateFields).then(() => {
                resolve()
            }).catch((error) => {
                console.log(error);
                reject()
            })
        })
    },

    deleteBanner: (bannerId)=>{
        return new Promise((resolve,reject)=>{
            bannerModel.findByIdAndDelete(bannerId).then(()=>{
                resolve()
            }).catch((error)=>{
                console.log(error);
                reject(error)
            })
        })
    }
}
