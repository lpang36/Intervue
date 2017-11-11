'use strict';

const request = require('request');

const BASE_URL = "insert lawrence's server";

const questions = {

};

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

function questions(interviewQuestions) {
  var numQuestions[10] = {
    /// ryan fill in dictionary of questions
  }
}

function onSessionStarted(sessionStartedRequest, session) {
  console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}')
}

function onIntent(intentRequest, session, callback) {
  console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

   const intent = intentRequest.intent;
   const intentName = intentRequest.intent.name;

   if (intentName === 'getQuestion') {
       categorySelect(intent, session, callback);
   } else if (intentName === 'answerQuestion') {
       answerQuestion(intent, session, callback);
   } else if (intentName === 'repeatQuestion') {
       repeatQuestion(intent, session, callback);
   } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent' || intentName === 'endSkill') {
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
