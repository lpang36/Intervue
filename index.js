//various libraries
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

var User = mongoose.model("User",userSchema);
var Question = mongoose.model("Question",questionSchema);

//express web app
var express = require('express');
var app = express();
app.use('/static',express.static(__dirname+'/static'));
app.set('view engine', 'ejs');
app.set('views','./views');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function(req,res) {
  res.render('home');
});

//post request to get interview q
//send post request
//returns response with question object in json format
//parameter relevant to alexa should be the question parameter, which contains the text of the question
app.get('/question/:username', function(req,res) {
  Question.count().exec(function(err,count) {
    var random = Math.floor(Math.random()*count);
    Question.findOne({}).skip(random).lean().exec(function (err,question) {
      io.emit('question',{question: question, username: req.params.username});
      res.send(JSON.stringify(question));
      res.end();
    });
  });
});

function analyzeKeywords(params,question,tone,req,res) {
  const NLU = require('watson-developer-cloud/natural-language-understanding/v1');
  var url = params.url || 'https://gateway.watsonplatform.net/natural-language-understanding/api';
  var use_unauthenticated =  params.use_unauthenticated || false ;
  const nlu = new NLU({
    'username': "ee3e97b8-c3db-43ae-b12d-0a835bfe0309",
    'password': "v8MKD024JSAb",
    'version_date': '2017-02-27',
    'url': url,
    'use_authenticated': use_unauthenticated
  });
  const input = {
    "text": params.textToAnalyze,
    "features": {
      "keywords": {
        "sentiment": false,
        "emotion": false,
        "limit": question.keywords.length
      }
    }
  }
  nlu.analyze(input,function(err,value){
    userKeywords = []
    value.keywords.forEach(function (keyword){
      userKeywords.push(keyword.text);
    });
    var length = params.textToAnalyze.split(' ').length;
    var count = 0;
    userKeywords.forEach(function(word){
      question.keywords.forEach(function(keyword){
        var flag = false;
        if ((keyword.indexOf(word)!=-1||word.indexOf(keyword)!=-1)&&!flag) {
          count++;
          flag = true;
        }
      });
    });
    var keywordMatches = count/question.keywords.length; //a percentage
    var sum = 0;
    tone.forEach(function(t){sum+=t;});
    var score = (sum/13+(length>50&&length<700)+keywordMatches)/3; //some aggregate of the above, will be between 0 and 1
    User.findOne({name: req.params.username}).exec(function (err2,user) {
      if (!err2) {
        //update user stats
        user.numQuestions = user.numQuestions+1;
        user.numQuestionsPerCategory[categoryMap[question.category]] = user.numQuestionsPerCategory[categoryMap[question.category]]+1;
        user.score = (user.score*(user.numQuestions-1)+score)/user.numQuestions;
        user.scorePerCategory[categoryMap[question.category]] = (user.scorePerCategory[categoryMap[question.category]]*(user.numQuestionsPerCategory[categoryMap[question.category]]-1)+score)/user.numQuestionsPerCategory[categoryMap[question.category]];
        user.length = (user.length*(user.numQuestions-1)+length)/user.numQuestions;
        user.keywordMatches = (user.keywordMatches*(user.numQuestions-1)+keywordMatches)/user.numQuestions;
        for (var i = 0; i<user.tone.length; i++) {
          user.tone[i] = (user.tone[i]*(user.numQuestions-1)+tone[i])/user.numQuestions;
        }
        user.save();
      }
    });
    var advice = "Your score on this question was "+score+". "+question.defaultAdvice;
    var fillerText = params.textToAnalyze.toUpperCase();
    if((/\bUM\b/).test(fillerText) ||
       (/\bUH\b/).test(fillerText) ||
       (/\bAH\b/).test(fillerText) ||
       (/\bLIKE\b/).test(fillerText) ||
       (/\bOKAY\b/).test(fillerText))
      advice+="Try to use less filler words.";
    else if((tone[0] > 0.5) || (tone[4] > 0.5) || (tone[2] > 0.5))
      advice+="Try to sound more positive";
    else if(tone[7] > 0.5)
      advice+="Try to sound more confident in your answer";
    else if(tone[3] > 0.6)
      advice+="You did well by sounding positive.";
    else if(tone[6] > 0.6)
      advice+="You did well by sounding confident";
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
    io.emit('answer',{advice: advice, username: req.params.username, tone: tone, score: score, answer: params.textToAnalyze});
    res.send({
      text: advice //advice to give
    });
    res.end();
  });
}

function analyzeTone(params,question,req,res) {
  const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
  var url = params.url || 'https://gateway.watsonplatform.net/tone-analyzer/api' ;
  var use_unauthenticated =  params.use_unauthenticated || false ;
  const tone_analyzer = new ToneAnalyzerV3({
    'username': params.username,
    'password': params.password,
    'version_date': '2016-05-20',
    'url' : url,
    'use_unauthenticated': use_unauthenticated
  });
  tones = [];
  tone_analyzer.tone({'text': params.textToAnalyze}, function(err, value) {
    value2 = JSON.stringify(value, null, 2);
    //console.log(value2);
    for (var i = 0; i<5; i++) {
      tones.push(JSON.parse(value2).document_tone.tone_categories[0].tones[i].score);
    }
    for (var i = 0; i<3; i++) {
      tones.push(JSON.parse(value2).document_tone.tone_categories[1].tones[i].score);
    }
    for (var i = 0; i<5; i++) {
      tones.push(JSON.parse(value2).document_tone.tone_categories[2].tones[i].score);
    }
    const input = {
      'textToAnalyze': params.textToAnalyze,
      'username': params.username,
      'password': params.password,
      'url' : 'https://gateway.watsonplatform.net/natural-language-understanding/api',
      'use_unauthenticated' : false
    }
    analyzeKeywords(input,question,tones,req,res);
  });
}

//post request for response to interview q
//send post request with three parameters, text, question id, and username
//returns response with one parameter, text (the suggested advice), in json format
//also updates user stats
app.get('/answer/:text/:id/:username/', function(req,res) {
  Question.findOne({id: decodeURI(parseInt(req.params.id))}).exec(function (err,question) {
    var text = decodeURI(req.params.text);
    const input = {
      'textToAnalyze': text,
      'username': '3ca875ed-5a26-44a7-9aea-9fe5d9dfd790',
      'password': 'DVZxwlNzF701',
      'url' : 'https://gateway.watsonplatform.net/tone-analyzer/api',
      'use_unauthenticated' : false
    };                                
    analyzeTone(input,question,req,res);
  });
});

app.get('/live/:username/', function(req,res) {
  User.findOne({name:req.params.username}).exec(function(err,user) {
    if (!err) {
      res.render('index',{
        user: user
      });
    }
    else {
      res.render('notFound');
    }
  });
});

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

io.on('connection',function(socket){
  console.log("a user has connected");
});

http.listen((process.env.PORT || 5000), function () {
  var host = http.address().address
  var port = http.address().port
  console.log("Example app listening at http://%s:%s", host, port);
  /*
  var text = "Let us banish forever all traces of wonder from our lives. Yet there are believers who insist that, using recent advances in archaeology, the ship can be found. They point, for example, to a wooden sloop from the 1770s unearthed during excavations at the World Trade Center site in lower Manhattan, or the more than 40 ships, dating back perhaps 800 years, discovered in the Black Sea earlier this year.";
  var req = {
    "body": {
      "text": text,
      "id": 0,
      "username": "test"
    }
  };
  const input = {
      'textToAnalyze': text,
      'username': '3ca875ed-5a26-44a7-9aea-9fe5d9dfd790',
      'password': 'DVZxwlNzF701',
      'url' : 'https://gateway.watsonplatform.net/tone-analyzer/api',
      'use_unauthenticated' : false
  }
  var res = {};
  Question.findOne({id: req.body.id}).exec(function (err,question) {
    analyzeTone(input,question,req,res);
  });
  */
});
