var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");

module.exports = function (app) {
	return {
		get: function (req, res) {
			var date = req.query.date;
			var app_name = req.params.app_name;
			app.models.Commit.find({
				application: app_name,
				created: date
			}).then(function (commits) {
				res.json(commits);
			})
		},
		post: function (req, res) {
			const body = req.body;

			var webhook = new app.models.Webhook();

			webhook.application = body.repository.name;
			webhook.reference = body.reference;
			webhook.name = body.name;

			const commit_hash = {
				'new': body.push.changes[0].new.target.hash,
				'old': body.push.changes[0].old.target.hash
			}

			logger.info("Range Commit Hash:", commit_hash.new + ".." + commit_hash.old)

			const repository = {
				name: body.repository.name,
				owner: body.repository.owner.username
			}
			var gitRepo = new GitRepo(repository.owner, repository.name);
			gitRepo.commits(commit_hash.new, commit_hash.old).then(commits => gitRepo.withDiff(commits)).then(commits => {

					webhook.commits = commits;
					// webhook._application = release.application;

					webhook.commits = commits
					webhook.save().then(function (commit) {
						res
							.status(201)
							.json(webhook);
					}, err => app.handlers.error.errorHandler(err, res));
				})
				.catch(err => app.handlers.error.errorHandler(err, res))
		}
	}
}