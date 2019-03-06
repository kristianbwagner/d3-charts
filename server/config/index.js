module.exports.setEnvVariables = () => {
	// Append env variables to process.env so they can used on the server
	const envVariables = require("./config.env.json");
	for (const variable in envVariables) {
		if (envVariables.hasOwnProperty(variable)) {
			process.env[variable] = envVariables[variable]
		}
	}
	return envVariables;
}
