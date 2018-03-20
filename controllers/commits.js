var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");

module.exports = function (app) {
	return {
		get: function (req, res) {
			var date = req.query.date;
			var app_name = req.params.app_name;
			app.models.Commit.find({ application: app_name, created: date }).then(function (commits) {
				res.json(commits);
			})
		},
		post: function (req, res) {
			const body = req.body;

			var release = new app.models.Release();

			release.application = body.repository.name;
			release.reference = body.reference;
			release.name = body.name;

			var commit = new app.models.Commit();
			const commit_hash = {
				'new':body.push.changes[0].new.target.hash,
				'old':body.push.changes[0].old.target.hash
				}

			logger.info("Range Commit Hash:",commit_hash.new+".."+commit_hash.old)
	
			const repository = { name: body.repository.name, owner: body.repository.owner.username }
			var gitRepo = new GitRepo(repository.owner, repository.name);
			gitRepo.commits(commit_hash.new, commit_hash.old).then(commits => gitRepo.withDiff(commits)).then(commit => {
				
				release.commits = commits;
				release._application = application;

				// release.save().then(function (release) {
					// res.status(201);
					// res.json(release);
				// }, err => errorHandler(err, res));
			})
			.catch(ex=>res.status(ex.code).json(ex.message))
		}
	}
}