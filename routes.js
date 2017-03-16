module.exports = function(app) {

	app.get("/apps/:app_name", app.controllers.web.release.get);

	app.post("/api/apps", app.controllers.api.application.post);
	app.post("/api/apps/:app_name/releases", app.controllers.api.release.post);
	app.get("/api/apps/:app_name/releases", app.controllers.api.release.get);

};