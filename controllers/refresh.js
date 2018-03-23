var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");

module.exports = function (app) {
    return {
        get: function (req, res) {

            app.models.Application.findOne({ name: req.params.app_name }, { _id: false }).then(function (application) {

                if (!application) {
                    app.handlers.error.errorHandler(`Application ${req.params.app_name} not found`, res, 404);
                    return;
                }

                app.models.Release.find({ application: req.params.app_name }, function (err, releases) {
                    for (var i = 0; i < releases.length; i++) {
                        releases[i]._application = application;
                        releases[i].save();
                        logger.info(`Release ${releases[i].name} refreshed`);
                    }
                });

                res.status(202);
                res.end();

            }).catch(err => app.handlers.error.errorHandler(err, res));

        }
    }
}