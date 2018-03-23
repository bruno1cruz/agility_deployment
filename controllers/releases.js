var moment = require("moment");

module.exports = function (app) {

    return {
        get: function (req, res) {

            var application = req.params.app_name;
            var createdDate = req.query.created;
            var query = { application: application };

            if (createdDate) {
                var validDate = moment(createdDate, 'YYYY-MM-DD', true).isValid();
                if (validDate) {
                    let momentCreateDate = moment(createdDate)
                    let createdDateUntil = momentCreateDate.clone().add(1, "day").format();
                    let createdDateSince = momentCreateDate.format();

                    query.created = { $gte: createdDateSince, $lt: createdDateUntil };

                } else {
                    app.handlers.error.errorHandler("data invalida", res, 400);
                    return;
                }
            }

            app.models.Release.find(query, { _id: false, commits: false }, { sort: { "reference.created": 1 } }, function (err, releases) {
                res.json(releases);
            });

        }
    }
}