# Museum + _

"Museum + _" borrows information from Google Maps, Yelp and Wikipedia to create an interactive map where users can plan a trip to the museum, or more importantly, what to do afterward. By clicking on any featured location, the user is automatically given information about that museum along with directions to the nearest bubble tea cafe, or other venue of the user's choosing.

## Getting started

The easiest way to see "Museum + _" in action is to visit [www.chrisrune.com/map](http://www.chrisrune.com/map). However, if you'd like to run the server locally, you can follow the directions below.

### Prerequisites 

Because Yelp Fusion requires that client secrets be kept safe on the server side, "Museum + _" is served by a bare-bones node.js application. 

To run a node.js server, you'll need to install [node.js](https://nodejs.org/en/) and [node packet manager](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm). 

Next, download the source code or clone [the neighborhood map repository](https://github.com/gtrabbit/neighborhoodMap) using Git. 

### Installing

Navigate to the root directory of the repository and run `npm install` to install all dependencies for the project. 

Now the project should be ready to go. I hope you kept your terminal window open, because the next step is to run `node server.js`. This will start the server running and listening on port 5000. Finally, you can view the page by opening your favorite web browser and going to localhost:5000. Enjoy.

## Author

This project was made by Chris Rune, in conjunction with Udacity's Full Stack NanoDegree program.

## License

This project is licensed under the WTFPL License -- visit the [wtfpl](http://www.wtfpl.net/about/) website for further details.

## Acknowledgements

This project could not have been completed without:

1. [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/)

2. [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)

3. [Yelp Fusion API](https://www.yelp.com/fusion)

4. [Snazzy Maps](https://snazzymaps.com/)

5. [Knockout.js](http://knockoutjs.com/)

