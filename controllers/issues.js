module.exports = function (app) {
    return {
        put: function (req, res) {

            if (!req.body || !req.body.patterns) {
                app.handlers.error.errorHandler("pattern list expected", res, 400);
                return;
            }

            app.models.Application.findOne({ name: req.params.app_name }).then(function (application) {
                if (!application.issues) {
                    application.issues = {}
                }
                application.issues = { patterns: req.body.patterns };
                application.save();
                res.status(204);
                res.end();
            });
        }
    }
}