var express = require('express');
var app = express();
var load = require('express-load');
var bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

load("models").then("controllers").then('routes').into(app);

app.listen(7000, function(){
	console.info("=== >> Agility Deployment is up and running");
});