var moment = require("moment");
var stats = require("stats-lite");

module.exports = function(app) {

    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var commit = Schema({
        hash:    {type: String},
        author:  {type:String},
        message: {type:String},
        created: {type:Date},
        diff:{
            additions: {type: Number},
            deletions: {type: Number},
            miliseconds: {type: Number}
        }
    },{_id :false});

    var release = Schema({
        name:        {type: String},
        compare:     {type: String},
        created:     {type:Date,default:Date.now},
        reference:     {
            created: {type: Date},
            type:    {type:String}
        },
        environment: {type: String},
        application: {type: String},
        commits:     {type: [commit]},
        diff:{
            additions:     {type: Number},
            deletions:     {type: Number},
            miliseconds:   {type: Number},
            percentile_95: {type: Number},
            size:          {type: Number}
        },
        team:     {
            amount:     {type: Number},
            since:      {type: Date}
        }
    }, { versionKey: false, collection : "release", toObject: { virtuals: true }, toJSON: { virtuals: true, commits: false } } );

    release.index({ "application": 1 });


    release.pre('save', function(next) {
        this.fillReference();
        next();
    })

    release.pre('save', function(next) {
        var _this = this;

        this.fillTeam().then(function(team,err){
            if (team){
                _this.team = team;
            } else {
                console.log("no team found for application %s release %s",_this.application, _this.name);
            }
            console.log(_this.team, _this.name)

            next(err || null);
        });


    })

    release.pre('save', function(next) {
        var differences = [];
        var additions = 0;
        var deletions = 0;

        var reference = moment(this.reference.created);

        for ( var i = 0; i < this.commits.length; i++){
            var created = moment(this.commits[i].created);

            var commitDifference = reference.diff(created);
            this.commits[i].diff.miliseconds = commitDifference;

            additions+= this.commits[i].diff.additions;
            deletions+= this.commits[i].diff.deletions;
            differences.push(commitDifference);
        }

        this.diff = {
            miliseconds: stats.mean(differences),
            deletions : deletions,
            additions:additions,
            percentile_95: stats.percentile(differences,0.95),
            size: this.commits.length
        };

        next();
    });

    release.methods.fillReference = function(){
        if (!this.reference|| !this.reference.type) {
            this.reference = {type: "build", created: this.created};
        } else {
            var firstCommit = this.commits[0];
            this.reference.created = firstCommit.created;
            console.log("using last commit creation as deployment reference [%s] %s %s", firstCommit.hash, firstCommit.message, firstCommit.created);
        }
    }

    release.methods.fillTeam = function(){
        console.log("team from %s since %s",this.application,this.reference.created)
        return app.models.Team.getTeamFrom(this.application,this.reference.created);
    }

    release.statics.sync = function(team){

        console.log("Will sync releases from %s", team.since);

        app.models.Release.find({application:team.application, "reference.created":{ "$gte" : team.since } })
            .then(function(releases){
                console.log(releases)
                for (var i=0; i< releases.length;i++) {
                    console.log("release %s[%s] synced", team.application, releases[i].name)
                    releases[i].save();
                }
            },console.error)

    }

    return db.model('release', release);
};
