const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt")

const adminSchema = new Schema({
    email: {
        type: String,
        default: 'ckraul03@gmail.com'
    },
    password: {
        type: String,
        default: 'myreee'
    },
});

const Admin = mongoose.model('admin', adminSchema);

const defaultAdmin = new Admin();



module.exports={
    defaultAdmin,
    Admin,
}