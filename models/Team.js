var Promise = require('promise');

module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var team = Schema({
        amount:     {type: Number},
        since:      {type: Date}
    }, { versionKey: false, collection : "team" });

    team.methods.current = function(app_id){
        return {amount:0};
    }

    return db.model('team', team);
};