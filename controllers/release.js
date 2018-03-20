var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");

module.exports = function (app) {
    return {
        post: function (req, res) {

            var body = req.body;

            var release = new app.models.Release();

            release.application = req.params.app_name;
            release.environment = body.environment;
            release.reference = body.reference;
            release.name = body.name;

            app.models.Application.findOne({ name: release.application }, { _id: false }).then(function (application) {
                if (!application) {
                    app.handlers.error.errorHandler(`Application ${release.application} not found`, res, 404);
                    return;
                }
                app.models.Release.findOne({ name: release.name, application: release.application }).limit(1).then(function (targetRelease) {
                    if (targetRelease) {
                        logger.info(`Release ${release.name} already exist!`)
                        res.status(200);
                        res.json(targetRelease)
                        return;
                    } else {

                        application.lastRelease().then(function (lastRelease) {
                            release.compare = lastRelease;

                            var gitRepo = new GitRepo(application.repository.owner, application.repository.name);

                            gitRepo.commits(release.name, release.compare).then(commits => gitRepo.withDiff(commits)).then(commits => {

                                release.commits = commits;
                                release._application = application;
                                release.save().then(function (release) {
                                    res.status(201);
                                    res.json(release);
                                }, err => app.handlers.error.errorHandler(err, res));

                            }, err => app.handlers.error.errorHandler(err, res));
                        }, err => app.handlers.error.errorHandler(err, res));
                    }

                }, err => app.handlers.error.errorHandler(err, res));

            }).catch(err => app.handlers.error.errorHandler(err, res));

        },
        get: function (req, res) {

            let application = req.params.app_name;
            let release = req.params.name;

            app.models.Release.findOne({ application: application, name: release }, { _id: false, commits: false }, { sort: { "reference.created": 1 } }, function (err, release) {
                if (release) {
                    res.json(release);
                } else {
                    app.handlers.error.errorHandler("release não foi encontrada", res, 404);
                    return;
                }
            });
            return

        },
        delete: function (req, res) {

            let applicationName = req.params.app_name;
            let releaseName = req.params.name;
            app.models.Application.findOne({ name: applicationName }, { _id: false }).then(function (application) {
                if (!application) {
                    app.handlers.error.errorHandler(`Application ${applicationName} not found`, res, 404);
                    return;
                }
                app.models.Release.findOne({ name: releaseName, application: applicationName }).limit(1).then(function (release) {
                    if (!release) {
                        app.handlers.error.errorHandler(`Release ${releaseName} not found`, res, 404);
                        return;
                    }
                    application.lastRelease().then(function (lastReleaseName) {

                        if (release.name == lastReleaseName) {
                            app.models.Release.remove({ name: release.name }).then(function () {
                                res.status(204);
                                res.end();
                            }).catch(err => app.handlers.error.errorHandler(err, res));
                        } else {

                            application.afterRelease(release).then(function (afterRelease) {

                                afterRelease.compare = release.compare

                                var gitRepo = new GitRepo(application.repository.owner, application.repository.name);

                                gitRepo.commits(afterRelease.name, afterRelease.compare).then(commits => gitRepo.withDiff(commits)).then(function (commits) {

                                    afterRelease.commits = commits;
                                    afterRelease._application = application;

                                    afterRelease.save().then(function (releaseUpdate) {
                                        app.models.Release.remove({ name: release.name }).then(function () {
                                            res.status(204);
                                            res.end();
                                        }).catch(err => app.handlers.error.errorHandler(err, res));
                                    }, err => app.handlers.error.errorHandler(err, res));

                                }, err => app.handlers.error.errorHandler(err, res));

                            }, err => app.handlers.error.errorHandler(err, res));

                        }
                    }, err => app.handlers.error.errorHandler(err, res));
                }, err => app.handlers.error.errorHandler(err, res));

            }).catch(err => app.handlers.error.errorHandler(err, res));
        }
    }
}