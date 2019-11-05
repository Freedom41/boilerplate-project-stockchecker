var request = require('request');
var stock = require('../models/stock.js')
var axios = require('axios');

module.exports = async function stockReq(symb) {
    const stockapi = "https://repeated-alpaca.glitch.me/v1/stock/";
    const stockPrice = stockapi + symb + "/quote";

    try {
        var data = await axios.get(stockPrice)
            .then((res) => {
                if (res.data == 'Unknown symbol') {
                    return res.data
                } else {
                    return res.data.latestPrice
                }
            })
            .catch((err) => {
                console.log(err)
                return err
            })
    } catch (err) {
        return err
    }
    return data
};

