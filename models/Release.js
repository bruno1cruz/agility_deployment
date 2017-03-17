var moment = require("moment");

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
        commits:     {type: [commit], select: false},
        diff:{
            additions:   {type: Number},
            deletions:   {type: Number},
            miliseconds: {type: Number}
        }
    }, { versionKey: false, collection : "release", toObject: { virtuals: true }, toJSON: { virtuals: true, commits: false } } );

    release.pre('save', true, function(next, done) {
        var difference = 0;
        var additions = 0;
        var deletions = 0;

        if (!this.reference|| !this.reference.type) {
            this.reference = {type: "build", created: this.created};
        } else {
            var firstCommit = this.commits[0];
            this.reference.created = firstCommit.created;
            console.log("using first commit creation as deployment reference [%s] %s %s", firstCommit.hash, firstCommit.message, firstCommit.created);
        }

        var reference = moment(this.reference.created);

        for ( var i = 0; i < this.commits.length; i++){
            var created = moment(this.commits[i].created);

            var commitDifference = reference.diff(created);
            this.commits[i].diff.miliseconds = commitDifference;
            
            additions+= this.commits[i].diff.additions;
            deletions+= this.commits[i].diff.deletions;
            difference+= commitDifference;
        }

        var miliseconds = difference / this.commits.length
        
        this.diff = {miliseconds:miliseconds, deletions : deletions, additions:additions };

        next();
        done();
    });

    return db.model('release', release);
};