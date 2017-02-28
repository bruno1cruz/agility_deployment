module.exports = function(app) {

	app.get("/releases", app.controllers.release.post);

};