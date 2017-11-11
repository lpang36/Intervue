//various libraries
var http = require('http');
var fs = require('fs');
var url = require('url');
var mongoose = require('mongoose');

//other vars
var uristring = 
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/hp';
var token;

//define port
var port = process.env.PORT || 5000;
mongoose.connect(uristring, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });

//mongodb schemas for user and interview question
var userSchema = mongoose.Schema({
  name: String,
  password: String,
  id: Number
  //add other stats
}, {collection:'users'});

var questionSchema = mongoose.Schema({
  question: String,
  category: String,
  keywords: Array
  //add other params
}, {collection:'questions'});

var user = mongoose.model("user",userSchema);
var question = mongoose.model("question",questionSchema);

//express web app
var express = require('express');
var app = express();
app.use('/static',express.static(__dirname+'/static'));
app.set('view engine', 'ejs');
app.set('views','./views');

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//display user stats, or 404 page if not found
app.get('/:username/', function(req,res) {
  User.findOne({name: req.params.username}).exec(function (err,user) {
    if (!err) {
      res.render('user',{
        user: user
      });
    }
    else {
      res.render('notFound');
    }
  });
});

//post request to get interview q
//send post request with one parameter, category
//returns response with question object in json format
//parameter relevant to alexa should be the question parameter, which contains the text of the question
app.post('/question', function(req,res) {
  Question.count().exec(function(err,count) {
    var random = Math.floor(Math.random()*count);
    Question.findOne({category: req.body.category}).skip(random).lean().exec(function (err,question) {
      res.send(JSON.stringify(question));
    });
  });
});

//post request for response to interview q
//send post request with two parameters, text and username
//returns response with one parameter, text (the suggested advice), in json format
//also updates user stats
app.post('/answer', function(req,res) {
  var text = req.body.text;
  //do processing on text
  User.findOne({name: req.params.username}).exec(function (err,user) {
    if (!err) {
      //update user stats
    }
  });
  res.send({
    text: "" //advice to give
  });
});

var server = app.listen((process.env.PORT || 5000), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
});