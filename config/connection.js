const mongoose = require('mongoose')
const multer = require('multer')




mongoose.connect('mongodb://0.0.0.0:27017', { useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log("Connected to mongoose"))


