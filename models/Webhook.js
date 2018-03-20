module.exports = function(app){

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var commit = Schema({
        hash:    {type: String},
        author:  {type:String},
        message: {type:String},
        created: {type:Date},
        error:   {type:Boolean},
        diff:{
            additions: {type: Number},
            deletions: {type: Number},
            miliseconds: {type: Number}
        }
    });


    var webhook = Schema({
        name:        {type: String},
        compare:     {type: String},
        created:     {type:Date,default:Date.now},
        reference:     {
            created: {type: Date},
            started: {type: Date},
            type:    {type:String}
        },
        environment: {type: String},
        application: {type: String},
        commits:     {type: [commit]},
        issues:      {type: [String]},
        diff:{
            additions:     {type: Number},
            deletions:     {type: Number},
            miliseconds:   {type: Number},
            percentile_95: {type: Number},
            size:          {type: Number}
        }
    })

    webhook.index({ "application": 1 });


    webhook.pre('save',function(next){
        const self = this;
        self.issues = self.extractIssue(self.commits)
        next();
    })

    webhook.methods.extractIssue = function(commits){
        const regex = /\[\s*([\w]*)\s*-\s*([\d]*).*\s*\]/g
        const issues = []
        var issue_match;
    
        for(var i = 0 ; i < commits.length; i ++){
            issue_match = regex.exec(commits[i].message)
            issues.push(issue_match[1] + "-" + issue_match[2])
            regex.lastIndex = 0
        }
        return issues;
    }

    /* commit.methods.findCommitsByDate = function(name,date){
        console.log(name + '\t' + date);
    } */

    return mongoose.model('webhook', webhook);
};