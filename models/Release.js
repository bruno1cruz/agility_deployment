module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var comment = Schema({
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
        commits:     {type: [comment]}
    }, { versionKey: false, collection : "release" });


    return db.model('release', release);
};