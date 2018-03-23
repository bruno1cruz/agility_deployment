var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");
var Promise = require("promise");
var moment = require("moment");

module.exports.errorHandler = function(err, response, statusCode) {
	logger.info(statusCode)
	statusCode = statusCode || 500;
	response.status(statusCode);
	var message = err instanceof Error ? err.message : err
	console.log(err)
	logger.error(`${message}`, { stacktrace: err, statusCode: statusCode });
	response.json({"message": message });
}
