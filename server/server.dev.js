// Dependencies
const express = require('express');
const path = require('path');
const history = require("connect-history-api-fallback")
const webpack = require('webpack');
const webpackconfig = require('../build/webpack.dev.js');
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackCompiler = webpack(webpackconfig);
const port = process.env.PORT || 3000;
const app = express();

// Server startup log
console.log(`> Starting dev server...`);

// Common middleware
require('./middleware')(app);

// History fallback
app.use(history());

// Dev middleware
app.use(webpackMiddleware(webpackCompiler, {
	logLevel: "silent"
}));

app.use(webpackHotMiddleware(webpackCompiler, {
	log: false,
	path: '/__webpack_hmr',
	heartbeat: 5000
}));

// Prod middleware
app.use(express.static(path.join(__dirname,'../dist')));

// Start server
app.listen(port, () => {
	console.log(`> Dev server started at http://localhost:${port}/`)
	console.log(`> Compiling webpack bundle...`)
});
