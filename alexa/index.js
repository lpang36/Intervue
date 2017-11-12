const Alexa = require('alexa-sdk');
var http = require('http');
var https = require('https');
const user = "John";
var util = require('util');
var qid = 0;

const APP_ID = 'amzn1.ask.skill.767ff4a2-1513-4028-a37b-1476f0317390';
var serviceHost = 'https://intervue.herokuapp.com';

exports.handler = function (event, context) {
  //var alexa = Alexa.handler(event, context);
  //alexa.registerHandlers(handlers);
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
                    console.log("succeed");
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

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
      //this.emit(':talk',"begun");
        console.log("worked on session started");
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);

    var speechOutput = "Do you want to slay your next interview?"
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", "false"));

    //this.emit(':talk',"launch");
    console.log("worked on launch");
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent, intentName = intentRequest.intent.name;
    var param = "";
    //this.emit(':talk',"intent"); // broken
    if (intentName === 'LaunchRequest'){
          param = "/question/"+user;
          //var output = "help me";
          //callback(session.attributes, buildSpeechletResponseWithoutCard(output, "", "false"));

    } else if (intentName === 'AlexaAsks') {
        var responseString = getResponse();
    } else if (intentName === 'UserAnswers') {
          var message = intentRequest.intent.slots.answer.value;
          param = encodeURI("/answer/"+message+"/"+qid+"/"+user);
          // get();
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
    //this.emit(':talk',"bye");
}

function handleTestRequest(intent, session, callback, param) {
  // var self = this;
  //this.emit(':talk',"testing101");
    console.log("intent: ", util.inspect(intent, {depth: 5}));
    console.log("session: ", util.inspect(session, {depth: 5}));
    var urlData = param;
    var url = serviceHost;
    httpGet(url, urlData, function (response) {
        console.log(response);
        var speechOutput = JSON.parse(response).question;
        // self.emit(':ask', speechOutput);
        //var responseData = JSON.parse(response);
        callback(session.attributes,buildSpeechletResponseWithoutCard(speechOutput, "", "false"));
        console.log(speechOutput);
    }, function (errorMessage){
            callback(session.attributes, buildSpeechletResponseWithoutCard(errorMessage, "", "false"));
        }
      );
}

// ------- Helper functions to build responses -------
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        }, reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    console.log("built");
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
   console.log(url+urlData);
   var req = https.get(url+urlData, (res) => {
        console.log(res);
        console.log("RESPONSE");
        var body = '';
        res.on('data', (d) => {
            body += d;
        });
        res.on('end', (res) => {
        console.log("finished");
        callback(body);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        errorCallback(e.message);
    });
    req.end();
}
// function httpGet(url, urlData, callback, errorCallback) {
//    console.log("url: "+ url);
//    console.log("urlData: "+ urlData);
//    request.get(url+urlData,function(err,res){
//      if (err)
//        errorCallback(err);
//      else {
//        console.log(res);
//        callback(res);
//      }
//    });
// }

// function httpGet(url, urlData, callback, errorCallback) {
//    console.log("url: "+ url);
//    console.log("urlData: "+ urlData);
//     var options = {
//         host: url,
//         path: urlData,
//         rejectUnauthorized: false,
//         method: 'GET'
//     };
//     var req = https.request(options, (res) => {
//         console.log(res);
//         var body = '';
//         res.on('data', (d) => {
//             body += d;
//         });
//     res.on('error', function(e) {
//         console.log("Got error: " + e.message);
//         errorCallback(e.message);
//     });
//     res.on('end', function () {
//         console.log("finished");
//         callback(body);
//         var responseString = '';
//         const speechOutput = responseString;
//         mythis.emit(':tell', 'The answer is'+speechOutput);
//         });
//     });
//     req.end();
// }

String.prototype.trunc =
    function (n) {
        return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
    };
