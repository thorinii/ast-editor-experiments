var getConfig = require('hjs-webpack')

module.exports = getConfig({
  in: 'js/ide-main.js',
  out: 'output',

  output: {
    filename: 'bundle.js',
    cssFilename: 'bundle.css'
  },

  html: false,
  clearBeforeBuild: true,

  devServer: {
    hot: false,
    contentBase: __dirname
  }
})
