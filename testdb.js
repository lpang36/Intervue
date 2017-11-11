var mongoose = require('mongoose');

//other vars
var uristring = 
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/hp';

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
  score: Number,
  scorePerCategory: Array,
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

//var newdoc = new user({name:"test",numQuestions:6,numQuestionsPerCategory:[2,4],score:0.75,scorePerCategory:[0.6,0.9],tone:[0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.1,0,-0.3,-0.5],length:500,keywordMatches:0.4});
//newdoc.save(function(err){});

var newdoc = new question({question:"test",category:"Behavioural",keywords:["technology","desert"],id:0,defaultAdvice:"just give up"});
newdoc.save(function(err){});
