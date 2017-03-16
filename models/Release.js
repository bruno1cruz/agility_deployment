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
            deletions: {type: Number}
        }
    },{_id :false});
    
    var release = Schema({
        name:        {type: String},
        compare:     {type: String},
        created: {type:Date,default:Date.now},
        environment: {type: String},
        application: {type: String},
        commits:     {type: [commit], select: false},
        diff:{
            additions: {type: Number},
            deletions: {type: Number},
            miliseconds: {type: Number}
        }
    }, { versionKey: false, collection : "release", toObject: { virtuals: true }, toJSON: { virtuals: true, commits: false } } );

    release.pre('save', true, function(next, done) {
        var difference = 0;
        var additions = 0;
        var deletions = 0;

        for ( var i = 0; i < this.commits.length; i++){
            var reference = moment(this.created);
            var created = moment(this.commits[i].created);

            difference+= reference.diff(created);

            if ( this.commits[i].diff ){
                additions+= this.commits[i].diff.additions;
                deletions+= this.commits[i].diff.deletions;
            }

        }

        var miliseconds = difference / this.commits.length
        
        this.diff = {miliseconds:miliseconds, deletions : deletions, additions:additions };

        next();
        done();
    });

    return db.model('release', release);
};