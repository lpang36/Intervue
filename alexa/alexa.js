"use strict";

var Alexa = require("alexa-sdk");

var handlers = {
  "HelloIntent": function () {
    this.response.speak("I need to get a job");
    this.emit(':responseReady');
  },
  "LaunchRequest": function () {
    this.response.speak("You have come to the right place");
    this.emit(':responseReady');
  }
};

// take the speech, convert to text, send to server

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
