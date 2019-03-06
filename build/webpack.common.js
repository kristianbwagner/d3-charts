// Prod webpack config
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('vue-html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	stats: false,
  	module: {
    	rules: [
      	{
      	  	test: /\.vue$/,
        		use: 'vue-loader'
      	},
			{
			  test: /\.css$/,
			  use: ['vue-style-loader', 'css-loader']
			},
			{
			  	test: /\.scss$/,
			  	use: ['vue-style-loader', 'css-loader', 'sass-loader']
			},
			{
			  	test: /\.js$/,
			  	use: {
					loader: 'babel-loader',
			  		options: {
						presets: ['@babel/preset-env']
			 		}
			  	}
			}
    	]
  },
  plugins: [
		new FriendlyErrorsWebpackPlugin(),
    	new VueLoaderPlugin(),
		new HtmlWebpackPlugin({
			vue: true,
			title: 'Dashboards - Isobar Nordics',
		})
  ],
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: '[name].bundle.js', //'[name].[hash].bundle.js'
		chunkFilename: '[name].bundle.js',
		publicPath: '/'
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '../src'),
			'@globals': path.resolve(__dirname, '../src/styles/globals.scss'),
			'@mixins': path.resolve(__dirname, '../src/styles/mixins.scss'),
			'@variables': path.resolve(__dirname, '../src/styles/variables.scss')
		}
	}
}
