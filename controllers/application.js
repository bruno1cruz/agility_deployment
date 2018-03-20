var logger = require("../logger/logger.js");

module.exports = function (app) {

	return {
		post: function (req, res) {

			var body = req.body;
			var application = new app.models.Application(body);

			application.save(function (err, app) {
				if (err) {
					app.handlers.error.errorHandler(err, res, 400);
					return;
				}
				logger.info(`Application ${app.name} created`)
				res.location("/apps/" + app.name);
				res.status(201);
				res.end();
			})

		},
		get: function (req, res) {

			app.models.Application.find().then(function (apps) {
				res.json(apps);
			})

		}
	}
}
