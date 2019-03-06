const forceHttps = require('./force-https');
const helmet = require('helmet');

module.exports = (app) => {
	app.use(helmet());
	app.use(forceHttps);
}
