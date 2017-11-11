'use strict';

var Alexa = require("alexa-sdk");

var handlers = {
    "talkingIntent" : function() {
        this.response.speak("Nothing");
        this.emit(":responseReady");
    }
    "LaunchRequest": function () {
      this.response.speak("First Question");
      this.emit(":responseReady");
     }

}

exports.handler = function(event, context, callback) {
	var alexa = Alexa.handler(event,context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};
