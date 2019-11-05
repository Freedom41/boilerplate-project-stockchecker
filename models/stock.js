var mongoose = require('mongoose');
var env = require('dotenv').config();

const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 4 },
    function (err, db) {
        if (err) {
            console.log(err)
        } else {
            console.log("connected")
        }
    });

const stockSchema = mongoose.Schema({
    stock: String,
    ip: [String],
    like: Number
})

const stock = mongoose.model('stock', stockSchema)

module.exports = stock;