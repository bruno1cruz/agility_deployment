var moment = require("moment");
var stats = require("stats-lite");
var unique = require('array-unique');
var logger = require("../logger/logger.js");

module.exports = function (app) {

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var commit = Schema({
        hash: {
            type: String
        },
        author: {
            type: String
        },
        message: {
            type: String
        },
        created: {
            type: Date
        },
        error: {
            type: Boolean
        },
        diff: {
            additions: {
                type: Number
            },
            deletions: {
                type: Number
            },
            miliseconds: {
                type: Number
            }
        }
    }, {
        _id: false
    });

    var release = Schema({
        name: {
            type: String
        },
        compare: {
            type: String
        },
        created: {
            type: Date,
            default: Date.now
        },
        reference: {
            created: {
                type: Date
            },
            started: {
                type: Date
            },
            type: {
                type: String
            }
        },
        environment: {
            type: String
        },
        application: {
            type: String
        },
        commits: {
            type: [commit]
        },
        issues: {
            type: [String]
        },
        diff: {
            additions: {
                type: Number
            },
            deletions: {
                type: Number
            },
            miliseconds: {
                type: Number
            },
            percentile_95: {
                type: Number
            },
            size: {
                type: Number
            }
        }
    }, {
        versionKey: false,
        collection: "release",
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
            commits: false
        }
    });

    release.index({
        "application": 1
    });


    release.pre('save', function (next) {
        this.fillReference();
        next();
    })

    release.pre('save', function (next) {
        var differences = [];
        var additions = 0;
        var deletions = 0;

        var reference = moment(this.reference.created);

        for (var i = 0; i < this.commits.length; i++) {
            if (!this.commits[i].error) {
                var created = moment(this.commits[i].created);

                var commitDifference = reference.diff(created);
                this.commits[i].diff.miliseconds = commitDifference;

                additions += this.commits[i].diff.additions;
                deletions += this.commits[i].diff.deletions;
                differences.push(commitDifference);
            }
        }

        this.diff = {
            miliseconds: stats.mean(differences),
            deletions: deletions,
            additions: additions,
            percentile_95: stats.percentile(differences, 0.95),
            size: this.commits.length
        };

        next();
    });


    // issues
    release.pre('save', function (next) {
        var issues = [];

        for (var i = 0; i < this.commits.length; i++) {

            var _issues = this.getIssuesFromCommit(this.commits[i]);

            if (_issues) {
                issues = issues.concat(_issues);
            }
        }
        this.issues = unique(issues);

        next();
    });


    release.methods.fillReference = function () {
        var lastCommit = this.commits[this.commits.length - 1];
        if (!this.reference || !this.reference.type) {
            this.reference = {
                type: "build",
                created: this.created,
                started: lastCommit.created
            };
        } else {
            var firstCommit = this.commits[0];
            this.reference.created = firstCommit.created;
            this.reference.started = lastCommit.created;
            logger.info(`Using last commit creation as deployment reference [${firstCommit.hash}] ${firstCommit.message} ${firstCommit.created}`);
        }
    }


    release.statics.sync = function (team) {

        logger.info(`Will sync releases from ${team.since}`);

        app.models.Release.find({
                application: team.application,
                "reference.created": {
                    "$gte": team.since
                }
            })
            .then(function (releases) {
                for (var i = 0; i < releases.length; i++) {
                    logger.info(`release ${team.application}[${releases[i].name}] synced`)
                    releases[i].save();
                }
            }, console.error)

    }

    release.methods.getIssuesFromCommit = function (commit) {

        var patterns = this._application.issues ? this._application.issues.patterns : undefined;

        if (!patterns) {
            return;
        }

        patterns = patterns.join("-[0-9]*|") + "-[0-9]*";

        var issuesMatch = (commit.message || "").match(patterns);

        if (!issuesMatch) {
            return;
        }

        var issues = [];

        for (var i = 0; i < issuesMatch.length; i++) {
            issues.push(issuesMatch[0]);
        }

        logger.info(`Search for issues with ${patterns} into app[${this._application.name}] commit[${commit.hash}]`);

        return issues;
    }

    return mongoose.model('release', release);
};