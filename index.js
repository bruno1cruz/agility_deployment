var express = require('express');
var app = express();
var load = require('express-load');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(require('cors')());


// app.use(express.static(__dirname + '/public', 3600000));
app.use(express.static(__dirname + '/bower_components'));
app.use("/api", express.static(__dirname + '/api.yaml'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.Promise = require('promise');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.database = {
	connection: mongoose.connect(process.env.MONGODB)
};

load("models")
	.then('handlers')
	.then("controllers")
	.then('routes')
	.into(app);

app.listen(7000, function () {
	console.info("=== >> Agility Deployment is up and running");
});