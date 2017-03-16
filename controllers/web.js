
var GitRepo = require("../GitRepo.js");
var Promise = require("promise");

module.exports = function(app){

	return {
		release:{			
			get: function(req,res){

				res.render("index", {application:req.params.app_name});

			}
		}
	}

}