// Dev webpack config
const webpack = require('webpack')
const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports = merge(common, {
   mode: 'development',
   entry: {
      app: ['babel-polyfill', './src/app.js', 'webpack-hot-middleware/client']
	},
   devServer: {
	   historyApiFallback: true,
      hot: true,
      watchOptions: {
         poll: true
      }
   },
   plugins: [
      new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
   ]
})
