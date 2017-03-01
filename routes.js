module.exports = function(app) {

	app.post("/apps/:app_name/releases", app.controllers.release.post);

};