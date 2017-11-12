var request = require('request');
user = "John";
text = "This is an answer";
id = 0;

request.get("https://intervue.herokuapp.com/question/"+user, function(err,res){
  console.log(res.body);
});

var url = encodeURI(text+"/"+id+"/"+user);
request.get("https://intervue.herokuapp.com/answer/"+url, function(err,res) {
  console.log(res.body);
});
