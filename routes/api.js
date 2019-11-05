'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var env = require('dotenv').config();
var request = require('request');
var stockreq = require('../controller/stockreq.js');
var stock = require('../models/stock.js')

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {

      let sanitaizereq = req.query;
      var ip;
      var like;

      if (req.query.like) {
        like = true;
      } else {
        like = false;
      }

      if (req.headers['x-forwarded-for'] != undefined) {

        ip = req.headers['x-forwarded-for'].split(",");
        ip = ip[0]
      } else {
        ip = req.connection.remoteAddress;
      }
      if (Array.isArray(sanitaizereq.stock) && (sanitaizereq.stock.length > 2 || sanitaizereq.stock.length < 0)) {
        res.send('Select the name of a stock, only upto 2 must be selected')
      }
      else if (typeof (sanitaizereq.stock) == 'string') {
        let symb = req.query.stock.toUpperCase();
        let data = {}
        data.like = 1;
        data.stock = symb;
        data.price = await stockreq(symb)

        let stockData = await stock.findOne({ stock: data.stock }, async (err, docs) => {

          if (docs == null && like) {
            let stockInformation = new stock({ stock: data.stock, ip: [ip], like: 1 })
            await stockInformation.save(err => {
              console.log(err)
            })

            res.json({
              stockdata: {
                stock: data.stock,
                price: data.price,
                likes: data.like
              }
            })
          } else if (docs == null && !(like)) {
            let stockInformation = new stock({ stock: data.stock, ip: [], like: 0 })
            await stockInformation.save(err => {
              console.log(err)
            })

            res.json({
              stockdata: {
                stock: data.stock,
                price: data.price,
                likes: 0
              }
            })
          } else {
            if (!docs.ip.includes(ip) && like) {
              like = data.like + docs.like;
              let stockInformation = await stock.updateOne(
                { stock: data.stock },
                { $push: { ip: ip }, like: like },
                (err, docs) => {
                  if (err) {
                    console.log(err)
                  } else {
                    res.json({
                      stockdata: {
                        stock: data.stock,
                        price: data.price,
                        likes: like
                      }
                    })
                  }
                })
            } else {
              res.json({
                stockdata: {
                  stock: data.stock,
                  price: data.price,
                  likes: docs.like
                }
              })
            }
          }
        })
      } else {
        let symb = req.query.stock;
        let stock1 = await stockreq(symb[0].toUpperCase());
        let stock2 = await stockreq(symb[1].toUpperCase());

        if (stock1 == 'Unknown symbol' || stock2 == 'Unknown symbol') {
          res.send('error stock price not found')
        } else {

          var stock1like = await stock.findOne({ stock: symb[0].toUpperCase() }, async (err, docs) => {
            if (err) {
              console.log(err)
            }
            if (docs == null && like) {
              let stockInformation = new stock({ stock: symb[0].toUpperCase(), ip: [ip], like: 1 })
              await stockInformation.save((err, doc) => {
                if (err) {
                  console.log(err)
                }
              })
            } else if (docs == null && !(like)) {
              let stockInformation = new stock({ stock: symb[0].toUpperCase(), ip: [], like: 0 })
              await stockInformation.save((err, doc) => {
                if (err) {
                  console.log(err)
                }
              })
            } else if (!docs.ip.includes(ip) && like) {
              like = 1 + docs.like;
              let stockInformation = await stock.updateOne(
                { stock: docs.stock },
                { $push: { ip: ip }, like: like },
                (err, docs) => {
                  if (err) {
                    console.log(err)
                  } else {
                    return docs
                  }
                })
              return stockInformation
            } else {
              return docs
            }
          })

          var stock2like = await stock.findOne({ stock: symb[1].toUpperCase() }, async (err, docs) => {
            if (err) {
              console.log(err)
            }
            if (docs == null && like) {
              let stockInformation = new stock({ stock: symb[1].toUpperCase(), ip: [ip], like: 1 })
              await stockInformation.save((err, doc) => {
                if (err) {
                  console.log(err)
                }
              })
            } else if (docs == null && !(like)) {
              let stockInformation = new stock({ stock: symb[1].toUpperCase(), ip: [], like: 0 })
              await stockInformation.save((err, doc) => {
                if (err) {
                  console.log(err)
                }
              })
            } else if (!docs.ip.includes(ip) && like) {
              like = 1 + docs.like;
              let stockInformation = await stock.updateOne(
                { stock: docs.stock },
                { $push: { ip: ip }, like: like },
                (err, docs) => {
                  if (err) {
                    console.log(err)
                  } else {
                    return docs
                  }
                })
              return stockInformation
            } else {
              return docs
            }
          })

          if (stock1like == null) {
            if (like) {
              stock1like = { like: 1 }
            } else {
              stock1like = { like: 0 }
            }
          }

          if (stock2like == null) {
            if (like) {
              stock2like = { like: 1 }
            } else {
              stock2like = { like: 0 }
            }
          }

          let infostock = [];
          infostock.push({
            stock: symb[0].toUpperCase(),
            price: stock1,
            rel_likes: stock1like.like - stock2like.like,
          });
          infostock.push({
            stock: symb[1].toUpperCase(),
            price: stock2,
            rel_likes: stock2like.like - stock1like.like,
          })

          res.json({
            stockData: infostock
          })
        }
      }
    })
};
