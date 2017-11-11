'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var response_answer = require('../reponse_answer_helper');
chai.config.includeStack = true;

describe('ResponseAnswer', function() {
  var subject = new ResponseAnswer();
  var feedback;
  describe('#getResponse', function() {
    context('valid speech', function() {
      it('returns feedback', function() {
        feedback = 'I NEED THE TEXT OUTPUT FROM IBM WATSON';
        var value = subject.requestFeedback(feedback).then(function(obj) {
          return obj.IATA;
        });
        return expect(value).to.eventually.eq(feedback);
      });
    });
  });
});
