var Promise = require('promise');

module.exports = function(app) {

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var db = app.database.connection;

    var application = Schema({
        name:       {type: String},
        milestone:  {type: String},
        repository: {
        	owner: {type: String},
        	name: {type: String}
        },
        issues:     {
            patterns:    {type: [String]}
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

    application.methods.afterRelease = function(release){

        var _this = this;

        return new Promise(function(resolve, reject){

            _this.releaseCreatedAfterThan(release).then(function(releaseAfter){
                if (!releaseAfter || releaseAfter.length==0 ){
                    console.info("no releases found. using milesone %s",_this.milestone)
                    return resolve(_this.milestone);
                }
                return resolve(releaseAfter[0]);

            },console.error);

        });
    }



    application.methods.releaseByName = function(name){
        var _this = this;

        return new Promise(function(resolve, reject){
            app.models.Release.findOne({name:name , application: this.name}).limit(1).then(function(release){
                if (!release){
                    console.info("no releases found. using milesone %s",_this.milestone)
                    return resolve(release);
                }
                return resolve(release);
            },console.error);

        });
    }

    application.methods.releases = function(){
        return app.models.Release.find({application: this.name},{_id:false }, {sort:{_id:-1}});
    }

    application.methods.releaseCreatedAfterThan = function(release){
        return app.models.Release.find({application:this.name, created:{$gt:release.created}}).sort({_id:1}).limit(1);
    }

    return mongoose.model('application', application);
};