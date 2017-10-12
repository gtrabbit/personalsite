/* jshint node: true */
'use strict';

//basics
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const yelp = require('yelp-fusion');

//non-standard deps
const nodemailer = require('nodemailer');


//starting server
let port = normalizePort(process.env.PORT || 8888);
app.set('port', port);

let server = http.createServer(app);


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


//middleware


let jsonParser = bodyParser.json();



//prepare nodemailer
let transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'chrisrunemailer@gmail.com',
		pass: 'turtle123'
	}
});




//authorization with yelp
const client_id = 'SssjK_bgvYTwE28AaQVfAg';
const client_secret = 'srPUwdZ9qE0BNQGOfePxuSJrDmPh9jQdZBR5oX8QtsLWXDjjQATihDMswjNJYbsD';
let yelpClient;
//creates a yelp client with the auth token
yelp.accessToken(client_id, client_secret).then(response =>{
	yelpClient = yelp.client(response.jsonBody.access_token);
}).catch( e => {
	console.log(e);
});

app.get('/map', function(req, res){
	app.use('/assets', express.static(path.join(__dirname, '/../map/assets/')));
	res.sendFile(path.join(__dirname + '/../map/index.html'));
});

app.get('/yelp/:name/:loc', function(req, res){
	yelpClient.search({
		location: req.params.loc,
		term: req.params.name,
		limit: 1

	}).then(response =>{
		// yelpClient.
		res.send(response.jsonBody.businesses[0]);
	}).catch(e => {
  		console.log(e);
	});

});



app.get('/', function(req, res){
	app.use(express.static(__dirname + '/../portfolio/'));
	res.sendFile(path.join(__dirname + '/../portfolio/index.html'));
});


app.post('/sendemail', jsonParser, function(req, res){

	let mailOptions = {
		from: req.body.email,
		to: 'gtrabbit@gmail.com',
		subject: 'new message from ' + req.body.name + ' sent from your contact form',
		html: '<p>' + req.body.name + '(' + req.body.email + ")" + ' sent you the following message: </p>' + '<p>' + req.body.msg + '</p>'
	};
	transporter.sendMail(mailOptions, (err) =>{
		if (err){
			res.send(err);
		} else {
			res.send('Thank you for your response! The message was successfully delivered.');
		}
	
	});


});


//listening....
server.listen(port, function(){
	let host = server.address().address;
	let port = server.address().port;
	console.log(host);
	console.log('listening on http://%s:%s', host, port);
});

