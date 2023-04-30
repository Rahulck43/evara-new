const mongoose = require('mongoose')
const multer = require('multer')




mongoose.connect('mongodb+srv://Rahul:rahul9895450559@web.5bjwuqk.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log("Connected to mongoose"))


