var Promise = require('promise');
var request = require("request");
var ClientOAuth2 = require('client-oauth2')

function GitRepo(){
	 
	var oauthClient = new ClientOAuth2({
	  clientId: '',
	  clientSecret: '',
	  accessTokenUri: 'https://bitbucket.org/site/oauth2/access_token'
	});

	this._oauthClient= oauthClient;

}
	

GitRepo.prototype.token = function(){

	var token = this._oauthClient.createToken("banana","");

	return new Promise(function(resolve, reject){
		token.refresh().then(function(data){ resolve(data.accessToken);}, reject);
	});
}


GitRepo.prototype.commits = function(reference_to,reference_from){

	var promise_token = this.token();


	return new Promise(function(resolve,reject){

		promise_token.then(function(token){

			request({
				uri: "https://api.bitbucket.org/2.0/repositories/",
				headers:{
					"Authorization":"Bearer " + token
				}
			},function(error, response, body){
				if (error) reject(error)
				resolve(GitRepo._parse_commits(body));
			});

		}, reject)

	});

}


GitRepo._parse_commits = function(body){

	var _commits = JSON.parse(body).values;
	var commits = [];

	for (var i = 0, len = _commits.length; i < len; i++) {
	  var _commit = _commits[i];
	  commits.push({ "hash": _commit.hash, "created": _commit.date, "author": _commit.author.user.username, "message": _commit.message });
	}

	return commits;
}

module.exports = GitRepo;