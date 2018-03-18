module.exports = function(app){

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var commit = Schema({
        hash:    {type: String},
        author:  {type:String},
        message: {type:String},
        created: {type:Date},
        error:   {type:Boolean},
        diff:{
            additions: {type: Number},
            deletions: {type: Number},
            miliseconds: {type: Number}
        }
    });

    commit.index({ "application": 1 });

    /* commit.methods.findCommitsByDate = function(name,date){
        console.log(name + '\t' + date);
    } */

    return mongoose.model('commit', commit);
};