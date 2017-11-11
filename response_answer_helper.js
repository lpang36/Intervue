'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = '///// ENTER ENDPOINT';

function ResponseAnswer() { }

ResponseAnswer.prototype.requestFeedback = function(feedback) {
  return this.getAirportStatus(airportCode).then(
    function(response) {
      console.log('success' + feedback);
      return response.body;
    }
  );
};

ResponseAnswer.prototype.getFeedback = function(feedback) {
  var options = {
    method: 'GET',
    uri: ENDPOINT + feedback,
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};
module.exports = ResponseAnser;
