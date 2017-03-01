module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var application = Schema({
        name:       {type: String},
        milestone:  {type: String},
        created:    {type:Date,default:Date.now}
    }, { versionKey: false, collection : "application" });


    return db.model('application', application);
};