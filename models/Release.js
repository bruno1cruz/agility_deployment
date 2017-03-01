var moment = require("moment");

module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var commit = Schema({
        hash:    {type: String},
        author:  {type:String},
        message: {type:String},
        created: {type:Date}
    },{_id :false});
    
    var release = Schema({
        name: 		 {type: String},
        compare:     {type: String},
        created: {type:Date,default:Date.now},
        environment: {type: String},
        application: {type: String},
        commits:     {type: [commit]}
    }, { versionKey: false, collection : "release", toObject: { virtuals: true }, toJSON: { virtuals: true } } );


    release.virtual("diff").get(function(){
    
        var difference = 0;

        for ( var i = 0; i < this.commits.length; i++){
            var reference = moment(this.created);
            var created = moment(this.commits[i].created);

            difference+= reference.diff(created);
        }

        return difference / this.commits.length;
    });

    return db.model('release', release);
};