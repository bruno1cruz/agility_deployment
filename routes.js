module.exports = function (app) {

	app.get("/apps/:app_name", app.controllers.web.release.get);
	app.get("/apps/:app_name/refresh", app.controllers.refresh.get);

	app.get("/api/apps", app.controllers.application.get);
	app.post("/api/apps", app.controllers.application.post);

	app.put("/api/apps/:app_name/issues", app.controllers.issues.put);

	app.post("/api/apps/:app_name/releases", app.controllers.release.post);
	app.get("/api/apps/:app_name/releases", app.controllers.releases.get);
	app.delete("/api/apps/:app_name/releases/: name", app.controllers.release.delete);
	app.get("/api/apps/:app_name/releases/:name", app.controllers.release.get);

	app.get("/api/apps/:app_name/commits", app.controllers.webhook.get);
	app.post("/api/apps/commits", app.controllers.webhook.post);
};
