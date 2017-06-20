module.exports = function(app) {


	app.get("/apps/:app_name", app.controllers.web.release.get);
	app.get("/apps/:app_name/refresh", app.controllers.api.refresh.get);


	app.get("/api/apps", app.controllers.api.application.get);
	app.post("/api/apps", app.controllers.api.application.post);
	app.post("/api/apps/:app_name/releases", app.controllers.api.release.post);
	app.get("/api/apps/:app_name/releases", app.controllers.api.release.get);
	app.delete("/api/apps/:app_name/releases/:name", app.controllers.api.release.delete);


	app.post("/api/apps/:app_name/teams", app.controllers.api.team.post);

};