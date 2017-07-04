module.exports = function(app) {


	app.get("/apps/:app_name", app.controllers.web.release.get);
	app.get("/apps/:app_name/refresh", app.controllers.api.refresh.get);


	app.get("/api/apps", app.controllers.api.application.get);
	app.post("/api/apps", app.controllers.api.application.post);
	app.put("/api/apps/:app_name/issues", app.controllers.api.application.issues.put);
	app.post("/api/apps/:app_name/releases", app.controllers.api.release.post);
	app.get("/api/apps/:app_name/releases", app.controllers.api.releases.get);
	app.delete("/api/apps/:app_name/releases/:name", app.controllers.api.release.delete);
	app.get("/api/apps/:app_name/releases/:name", app.controllers.api.release.get);

	app.post("/api/apps/:app_name/teams", app.controllers.api.team.post);

};
