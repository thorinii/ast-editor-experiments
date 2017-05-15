var getConfig = require('hjs-webpack')

module.exports = getConfig({
  in: 'js/ide-main.js',
  out: 'public',

  output: {
    filename: 'bundle.js'
  },

  html: false,
  clearBeforeBuild: true,

  devServer: {
    hot: false,
    contentBase: __dirname
  }
})
