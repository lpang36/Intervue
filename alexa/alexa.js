'use strict';

var Alexa = require("alexa-sdk");
var message = get.message();
var response = get.response();

function post() {
  var request = require('request');
  request('http://www.google.com', function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
  });
}

function get() {
  var request = require('request');
  request('http://www.google.com', function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
  });
}

var handlers = {
    "talkingIntent" : function() {
        this.response.speak(message);
        this.emit(":responseReady");
        this.post();
    }
    "LaunchRequest": function () {
      this.response.speak("First Question");
      this.emit(":responseReady");
     }

    "Answer":function(){
      this.response.speak(response);
      this.emit(":responseReady");
      this.get();
    }

}



exports.handler = function(event, context, callback) {
	var alexa = Alexa.handler(event,context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};
