var express = require('express');
var app = express();
var load = require('express-load');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.Promise = require('promise');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.database= { connection : mongoose.connect("mongodb://localhost/agility") };

load("models").then("controllers").then('routes').into(app);


app.listen(7000, function(){
	console.info("=== >> Agility Deployment is up and running");
});