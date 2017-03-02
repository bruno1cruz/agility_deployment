var Promise = require('promise');

module.exports = function(app) {
    
    var Schema = require('mongoose').Schema;
    var db = app.database.connection;

    var application = Schema({
        name:       {type: String},
        milestone:  {type: String},
        repository: {
        	owner: {type: String},
        	name: {type: String}
        }
    }, { versionKey: false, collection : "application" });

    application.methods.lastRelease = function(){

        var _this = this;

        return new Promise(function(resolve, reject){

            _this.releases().limit(1).then(function(releases){
                if (!releases || releases.length==0 ){
                    console.info("no releases found. using milesone %s",_this.milestone)
                    resolve(_this.milestone);
                }

                return resolve(releases[0].name);
            },console.error);

        });
    }

    application.methods.releases = function(){
        return app.models.Release.find({application: this.name},{_id:false }, {sort:{_id:-1}});
    }


    return db.model('application', application);
};