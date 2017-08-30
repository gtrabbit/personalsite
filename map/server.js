/* jshint node: true */
'use strict';

//basics
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const yelp = require('yelp-fusion');


//starting server
const port = 5000;
app.set('port', port);


let server = http.createServer(app);



//middleware
app.use('/assets', express.static(path.join(__dirname, '/assets')));


//authorization with yelp
const client_id = 'SssjK_bgvYTwE28AaQVfAg';
const client_secret = 'srPUwdZ9qE0BNQGOfePxuSJrDmPh9jQdZBR5oX8QtsLWXDjjQATihDMswjNJYbsD';
let yelpClient;
//creates a yelp client with the auth token
yelp.accessToken(client_id, client_secret).then(response =>{
	yelpClient = yelp.client(response.jsonBody.access_token);
}).catch(e =>{
	console.log(e);
});




app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/index.html'));
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


//listening....
server.listen(port, function(){
	let port = server.address().port;
	console.log('listening on http://%s', port);
});
