var webpack = require('webpack')
var getConfig = require('hjs-webpack')

var config = getConfig({
  in: 'public/ide-main.js',
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

config.plugins.push(new webpack.SourceMapDevToolPlugin({
  filename: '[file].map'
}))
config.devtool = 'eval-source-map'

config.module.rules.push({
  test: /\.purs$/,
  use: [
    {
      loader: 'purs-loader',
      options: {
        src: [
          'bower_components/purescript-*/src/**/*.purs',
          'src/**/*.purs'
        ],
        bundle: false,
        psc: 'psa',
        watch: false,
        pscIde: false
      }
    }
  ]
})

config.resolve.modules = ['node_modules', 'bower_components']
config.resolve.extensions.push('.purs')

module.exports = config
