# Inspiration
We were inspired to create Intervue due to the lack of interview preparation options out there. Other than websites listing common interview questions and university run mock interviews which were not readily accessible, there were no other resources to receive feedback on interview skills. Our whole team is currently enrolled in first year co-op programs and thus, we will have job interviews in the imminent future. We wanted to create an application that would be able to simulate an job interview better than practicing in front of a mirror.

# What it does
Intervue uses the Amazon Echo and its built-in personal assistant Alexa to ask interview questions, receive responses from the user, and give back feedback on how to improve interview skills. Once Alexa receives response input, it is sent, in form of text, to IBM Watson which preforms tone analysis. The tone analyzer detects emotion and gives feedback based on the analysis. Outside of the tone analysis, common filler words are searched for and the length of the responses is measured to provide diverse feedback. The feedback is sent back to the Alexa which reads it to the user. Additionally, a web application that is connected to the server displays questions that are currently being asked.

# How we built it
Using javascript, a local web server was created. The server connects the database containing the interview questions to the Alexa which gets the questions and reads them out to the user. The Alexa audio input and output were implemented with java script using the Amazon Lambda platform. IBM Bluemix was used to create a connection with our project and the tone analyzer and allowed for audio input to reach IBM Watson where the analysis takes place.

# Challenges we ran into
Getting Alexa to listen and react to user input proved to be our main challenge as connecting the Amazon Skill to Lambda and testing caused many errors. Initially, we did not know how to run our code on Lamda and after we figured out how, our Echo was not responding to the invocation command.

# Accomplishments that we're proud of
We were proud of successfully adding IBM Watson components, providing functionality that would have not been possible otherwise. Getting the Alexa to respond to our start up invocation was also a major milestone that was a source for great relief.

# What we learned
We learned how to implement IBM Watson functionality into our project and to send data for Watson to analyze, using IBM Bluemix. Amazon AWS and Lamba were used while working with Alexa, environments none of us were familiar with. Through creating Intervue, we learned how to create individual components of the project, then connect them all together to create a functional product.

# What's next for Intervue
The next steps for Intervue would be to organize jobs by categories, with questions specific to that category. Users may be asked about their technical skills based on the job that they are applying for. As well as this, Hololens can be implemented to add, not only an audio, but visual component to our interview preparation platform and create a more authentic interview experience. Users would be able to face the pressure of facing an employer and become accustomed to it.

# Built With
* node.js
* Amazon Alexa
* AWS Lambda
* MongoDB
* socket.io
