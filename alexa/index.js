'use strict';

const Alexa = require('alexa-sdk');
var http = require('http');
var https = require('https');
const user = "John";
var util = require('util');
var qid = 0;

function get() {
    var request = require('request');
    var user = "John";
    var text = "This is an answer";
    var id = 0;

    request.get("https://intervue.herokuapp.com/question/"+user, function(err,res){
      console.log(res.body);
    });

    var url = encodeURI(text+"/"+id+"/"+user);
    request.get("https://intervue.herokuapp.com/answer/"+url, function(err,res) {
      console.log(res.body);
    });
};

const APP_ID = 'amzn1.ask.skill.767ff4a2-1513-4028-a37b-1476f0317390';
var serviceHost = 'https://intervue.herokuapp.com';

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
}

function questions() {
  var numQuestions = ["What is your greatest strength?", "What is your greatest weakness?", "Tell me about yourself.", "Why should we hire you?", "What are your salary expectations?", "Why are you leaving or have left your job?", "Why do you want this job?", "How do you handle stress and pressure?", "Describe a difficult work situation / project and how you overcame it.", "What are your goals for the future?"];
  return numQuestions[Math.floor(Math.random() * (9 - 0 + 1)) + 0];
}

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
    var cardTitle = "Welcome"
    var speechOutput = "Do you want to slay your next interview?"
    callback(session.attributes, buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent, intentName = intentRequest.intent.name;
    var param = "";

    if (intentName === 'LaunchRequest'){
          param = "/question/"+user;
          var output = "where is the pizza";
          callback(session.attributes, buildSpeechletResponseWithoutCard(output, "", "true"));
          get();
    } else if (intentName === 'AlexaAsks') {
         get();
    } else if (intentName === 'UserAnswers') {
          var message = this.event.answer.value;
          param = encodeURI("/answer/"+message+"/"+qid+"/"+user);
          get();
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent' || 'AMAZON.HelpIntent') {
            handleSessionEndRequest(callback);
    } else {
          throw new Error('Invalid intent');
    }
   handleTestRequest(intent, session, callback, param);
}
/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);

}

function handleTestRequest(intent, session, callback, param) {
    console.log("intent: ", util.inspect(intent, {depth: 5}));
    console.log("session: ", util.inspect(session, {depth: 5}));
    var urlData = param;
    var url = serviceHost;
    httpGet(url, urlData, function (response) {
        console.log(response);
        var responseData = JSON.parse(response);
        var output = 'OK, asked the service';
        callback(session.attributes, buildSpeechletResponseWithoutCard(output, "", "true"));
    }, function (errorMessage){
            callback(session.attributes, buildSpeechletResponseWithoutCard(errorMessage, "", "true"));
        }
      );
}

// ------- Helper functions to build responses -------

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

// Create a web request and handle the response.
function httpGet(url, urlData, callback, errorCallback) {
   console.log("url: "+ url);
   console.log("urlData: "+ urlData);
    var options = {
        host: url,
        path: urlData,
        rejectUnauthorized: false,
        method: 'GET'
    };
    var req = https.request(options, (res) => {
        var body = '';
        res.on('data', (d) => {
            body += d;
        });
    res.on('error', function(e) {
        console.log("Got error: " + e.message);
        errorCallback(e.message);
    });
    res.on('end', function () {
        callback(body);
        });
    });
    req.end();
}

String.prototype.trunc =
    function (n) {
        return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
    };
