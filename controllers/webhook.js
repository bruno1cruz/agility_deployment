var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");
var Promise = require('promise');

module.exports = function (app) {
	return {
		get: function (req, res) {
			var date = req.query.date || new Date().toDateString();
			var app_name = req.params.app_name;

			app.models.Application.find({
				name: app_name
			}).then(function (application){
				app_name = application.repository.name
			});

			var start_date = new Date(date);
			var end_date = new Date(date);
			end_date.setDate(end_date.getDate()+1);

			app.models.Webhook.find({
				application: app_name,
				created: {
					$gte: start_date,
					$lt: end_date
				}
			}).then(function (commits) {
				res.json(commits);
			})
		},
		post: async function (req, res) {
			const body = req.body;
			const application_name = body.repository.full_name.split("/").reverse()[0]
			const webhook = new app.models.Webhook();
			const repository = {
				name: application_name,
				owner: body.repository.owner.username
			}
			const response = [];
			var branch_name
			var change
			for (var i = 0; i < body.push.changes.length; i++) {
				webhook.application = application_name;
				webhook.name = application_name;
				
				change = body.push.changes[i];

				if (change.old == null && change.new == null) {
					response.push({
						"code": 404,
						"message": "Without informations.",
						"change_request": change
					})
					continue;
				}

				branch_name = change.new.name

				var gitRepo = new GitRepo(repository.owner, repository.name);

				if (!change.old) {
					await gitRepo
						.getCommitFromBranch(branch_name)
						.then(commits => gitRepo.withDiff(commits))
						.then(commits => commits.forEach((a,b,c)=>webhook.commits.push(a)))
						.catch(err => app.handlers.error.errorHandler(err, res))
					continue;
				}

				const commit_hash = {
					'new': change.new.target.hash,
					'old': change.old.target.hash
				}

				// logger.info("Range Commit Hash:", commit_hash.new + ".." + commit_hash.old)

				await gitRepo
					.commits(commit_hash.new, commit_hash.old)
					.then(commits => gitRepo.withDiff(commits))
					.then(commits => commits.forEach((a,b,c)=>webhook.commits.push(a)))
					.catch(err => app.handlers.error.errorHandler(err, res))
			}

			webhook.save().then(function (commit) {
				res.status(201).json({
					"response": response,
					"message": "Created"
				})
			}, err => app.handlers.error.errorHandler(err, res));
			
		}
	}
}