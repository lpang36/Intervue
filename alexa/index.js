'use strict';

const request = require('request');
var ENDPOINT = 'https://intervue.herokuapp.com/';

function GetPost() {
  GetPost.prototype.requestFeedback = function(feedback,uri) {
    //request for question: uri = "question"
    //request for answer: uri = "answer"
    return this.getFeedback(feedback,uri).then(
      function(response) {
        console.log('success' + feedback);
        return response.body;
      }
    );
  };

  GetPost.prototype.getFeedback = function(feedback,uri) {
    var options = {
      method: 'GET',
      uri: ENDPOINT + uri,AQQQQQ,
      resolveWithFullResponse: true,
      json: true
    };
    return request(options);
  };
}

module.exports = GetPost;

function buildSpeechletResponse(feedback, shouldEndSession) {

  return {
    outputSpeech: {
      type: 'PlainText',
      text: feedback,
    },
    shouldEndSession,
  };
};

function buildResponse(sessionAttributes, speechletResponse) {
  return{
    version: '1.0',
    sessionAttributes,
    response: speechletResponse,
  };
}

function questions() {
  var numQuestions = ["What is your greatest strength?", "What is your greatest weakness?", "Tell me about yourself.", "Why should we hire you?", "What are your salary expectations?", "Why are you leaving or have left your job?", "Why do you want this job?", "How do you handle stress and pressure?", "Describe a difficult work situation / project and how you overcame it.", "What are your goals for the future?"];
  return numQuestions[Math.floor(Math.random() * (9 - 0 + 1)) + 0];
}

function onSessionStarted(sessionStartedRequest, session) {
  console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}')
}

function onIntent(intentRequest, session, callback) {
  console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

   const intent = intentRequest.intent;
   const intentName = intentRequest.intent.name;

   if (intentName === 'AlexaAsks') {
       questions();
   } else if (intentName === 'UserAnswers') {
       var message = this.event.answer.value;
   } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
       handleSessionEndRequest(callback);
   } else {
       throw new Error('Invalid intent');
   }
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
}

exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        if (event.session.new) {
           onSessionStarted({
               requestId: event.request.requestId
           }, event.session);
       }

       if (event.request.type === 'LaunchRequest') {
           onLaunch(event.request,
               event.session,
               (sessionAttributes, speechletResponse) => {
                   callback(null, buildResponse(sessionAttributes, speechletResponse));
               });
       } else if (event.request.type === 'IntentRequest') {
           onIntent(event.request,
               event.session,
               (sessionAttributes, speechletResponse) => {
                   callback(null, buildResponse(sessionAttributes, speechletResponse));
               });
       } else if (event.request.type === 'SessionEndedRequest') {
           onSessionEnded(event.request, event.session);
           callback();
       }
   } catch (err) {
       callback(err);
   }
};
