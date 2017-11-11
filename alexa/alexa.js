'use strict';

var Alexa = require("alexa-sdk");
var message;
var response;

var handlers = {
    "talkingIntent" : function() {
        this.response.speak(message);
        this.emit(":responseReady");
    }
    "LaunchRequest": function () {
      this.response.speak("First Question");
      this.emit(":responseReady");
     }

    "Answer":function(){
      this.response.speak(response);
      this.emit(":responseReady");
    }

}

exports.handler = function(event, context, callback) {
	var alexa = Alexa.handler(event,context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};
