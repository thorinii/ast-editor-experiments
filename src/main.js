#!/usr/bin/env node

var path = require('path')
var express = require('express')
var compress = require('compression')

var serverConfig = {
  port: 3000,
  hostname: 'localhost'
}
var app = express()

var createServer = require('http').createServer

app.use(compress())

if (process.env.NODE_ENV !== 'production') {
  var webpack = require('webpack')

  var config
  try {
    config = require(path.join(__dirname, '../webpack.config.js'))
  } catch (e) {
    console.error(e.stack)
    console.error('Failed to load webpack config')
    process.exit(1)
  }

  var compiler = webpack(config)
  app.use(require('webpack-dev-middleware')(compiler, serverConfig))
}

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
})
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../output')))

var server = createServer(app)
server.listen(serverConfig.port, serverConfig.hostname, function (err) {
  if (err) {
    console.error(err)
    return
  }

  console.log('Listening at http://' + serverConfig.hostname + ':' + serverConfig.port)
})
