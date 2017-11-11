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
var categoryMap = {
  "behavioural": 0,
  "technical": 1
  //update as needed
};

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
  id: Number,
  //add other stats
  numQuestions: Number,
  numQuestionsPerCategory: Array,
  sentiment: Number,
  tone: Array,
  length: Number,
  keywordMatches: Number
}, {collection:'users'});

var questionSchema = mongoose.Schema({
  question: String,
  category: String,
  keywords: Array,
  id: Number,
  //add other params
  defaultAdvice: String
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
//send post request with three parameters, text, question id, and username
//returns response with one parameter, text (the suggested advice), in json format
//also updates user stats
app.post('/answer', function(req,res) {
  Question.findOne({id: req.body.id}).exec(function (err,question) {
    var text = req.body.text;
    //do processing on text
    var sentiment = 0;
    var tone = [0,0,0,0,0]; //joy anger disgust sadness fear
    var length = 0;
    var keywordMatches = 0; //a percentage
    User.findOne({name: req.params.username}).exec(function (err2,user) {
      if (!err2) {
        //update user stats
        user.numQuestions = user.numQuestions+1;
        user.numQuestionsPerCategory[categoryMap[question.category]] = user.numQuestionsPerCategory[categoryMap[question.category]]+1;
        user.sentiment = (user.sentiment*(user.numQuestions-1)+sentiment)/user.numQuestions;
        user.length = (user.length*(user.numQuestions-1)+length)/user.numQuestions;
        user.keywordMatches = (user.keywordMatches*(user.numQuestions-1)+keywordMatches)/user.numQuestions;
        for (var i = 0; i<user.tone.length; i++) {
          user.tone[i] = (user.tone[i]*(user.numQuestions-1)+tone[i])/user.numQuestions;
        }
        user.save();
      }
    });
    var advice = question.defaultAdvice;
    if (sentiment<0.25)
      advice+="You should make your answer more positive.";
    //do something for tone
    if (keywordMatches<0.5) {
      advice+="You should include some of these words in your reponse: ";
      question.keywords.forEach(function(word){
        advice+=word+", ";
      });
    }
    if (length>700)
      advice+="Try to keep your response to a shorter time.";
    else if (length<50)
      advice+="Try to give a more detailed response.";
    res.send({
      text: advice //advice to give
    });
  });
});

var server = app.listen((process.env.PORT || 5000), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
});