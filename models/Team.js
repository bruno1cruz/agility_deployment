var Promise = require('promise');

module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var team = Schema({
        amount:     {type: Number},
        since:      {type: Date},
        application: {type: String}
    }, { versionKey: false, collection : "team" });

    team.statics.getTeamFrom = function(app_name,reference){
        return app.models.Team.findOne({application: app_name, since: {$lte: reference} },{_id:false }, {sort:{_id:-1}});
    }

    team.index({ "application": 1 });

    return db.model('team', team);
};