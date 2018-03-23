var moment = require("moment");

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
            size: {
                type: Number
            }
        }
    });


    var webhook = Schema({
        name: {
            type: String
        },
        created: {
            type: Date,
            default: Date.now
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
    })

    webhook.index({
        "application": 1
    });


    webhook.pre('save', function (next) {
        const self = this;
        self.issues = self.extractIssue(self.commits)
        next();
    })

    webhook.pre('save', function (next) {
        const self = this;

        var obj = {};

        for (var i = 0; i < this.commits.length; i++)
            obj[this.commits[i].hash] = this.commits[i];

        this.commits = new Array();
        for (var key in obj)
            this.commits.push(obj[key]);

        console.log(this.commits)

        next();
    })

    webhook.pre('save', function (next) {
        var differences = [];
        var additions = 0;
        var deletions = 0;

        for (var i = 0; i < this.commits.length; i++) {
            if (!this.commits[i].error) {
                additions += this.commits[i].diff.additions;
                deletions += this.commits[i].diff.deletions;
            }
        }

        this.diff = {
            deletions: deletions,
            additions: additions,
            size: this.commits.length
        };
        next();
    });

    webhook.methods.extractIssue = function (commits) {
        const regex = /\[\s*([\w]*)\s*-\s*([\d]*).*\s*\]/g
        const issues = []
        var issue_match;

        for (var i = 0; i < commits.length; i++) {
            issue_match = regex.exec(commits[i].message)
            if (issue_match) {
                issues.push(issue_match[1] + "-" + issue_match[2])
            }
            regex.lastIndex = 0
        }
        return issues;
    }



    return mongoose.model('webhook', webhook);
};