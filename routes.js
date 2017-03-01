module.exports = function(app) {


	app.post("/apps", app.controllers.application.post);
	app.post("/apps/:app_name/releases", app.controllers.release.post);
	app.get("/apps/:app_name/releases", app.controllers.release.get);

};