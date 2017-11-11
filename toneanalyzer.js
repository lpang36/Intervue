var http = require('http');
var fs = require('fs');
var app = require('express')();
const PORT=3000;
fs.readFile('./index.html', function (err, html) {

  function main(params) {
    return new Promise(function (resolve, reject) {
      var res = {};
      const ToneAnalyzerV3 =
      require('watson-developer-cloud/tone-analyzer/v3');

      var url = params.url || 'https://gateway.watsonplatform.net/tone-analyzer/api' ;
      var use_unauthenticated =  params.use_unauthenticated || false ;

      const tone_analyzer = new ToneAnalyzerV3({
        'username': params.username,
        'password': params.password,
        'version_date': '2016-05-20',
        'url' : url,
        'use_unauthenticated': use_unauthenticated
      });

      tone_analyzer.tone({'text': params.textToAnalyze}, function(err, res) {
        if (err)
        reject(err);
        else
        resolve(res);
      });
    });
  }

  const input = {
    'textToAnalyze': 'I dont know',
    'username':      '3ca875ed-5a26-44a7-9aea-9fe5d9dfd790',
    'password':      'DVZxwlNzF701',
    'url' : 'https://gateway.watsonplatform.net/tone-analyzer/api',
    'use_unauthenticated' : false
  }

  var anger;
  var fear;
  var joy;
  var sadness;
  var confidence;
  var unsure;
  let feedback;
  var value2;
  var analyzed = main(input).then(function(value) {
    value2 = JSON.stringify(value, null, 2);
    //console.log(value2);
    anger = JSON.parse(value2).document_tone.tone_categories[0].tones[0].score;
    fear = JSON.parse(value2).document_tone.tone_categories[0].tones[2].score;
    joy = JSON.parse(value2).document_tone.tone_categories[0].tones[3].score;
    sadness = JSON.parse(value2).document_tone.tone_categories[0].tones[4].score;
    confidence = JSON.parse(value2).document_tone.tone_categories[1].tones[1].score;
    unsure = JSON.parse(value2).document_tone.tone_categories[1].tones[2].score;
    function giveFeedback() {
      if((anger > 0.5) || (sadness > 0.5) || (fear > 0.5))
      feedback = "Try to sound more positive";
      else if(unsure > 0.5)
      feedback = "Try to sound more confident in your answer";
      else if(joy > 0.6)
      feedback = "";
      else if(confidence > 0.6)
      feedback = "";
      else
      feedback = "Not bad.";
    }
    giveFeedback();
    console.log(feedback);
  })
  .catch(function(error)
  {
    console.log(error);
  });
  http.createServer(function(request, response) {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(html);
    response.end();
  }).listen(PORT);
});
