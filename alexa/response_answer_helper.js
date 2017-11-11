'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://intervue.herokuapp.com/';

function ResponseAnswer() { }

ResponseAnswer.prototype.requestFeedback = function(feedback,uri) {
  //request for question: uri = "question"
  //request for answer: uri = "answer"
  return this.getFeedback(feedback,uri).then(
    function(response) {
      console.log('success' + feedback);
      return response.body;
    }
  );
};

ResponseAnswer.prototype.getFeedback = function(feedback,uri) {
  var options = {
    method: 'GET',
    uri: ENDPOINT + uri,
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};
module.exports = ResponseAnser;
