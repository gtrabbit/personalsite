'use strict';
/* global google */
/* global ko */
/* global console */

const map = {
	markerList: [],
	places: [],
	eastend: null,
	DestInfoWindow: null,
	service: null,
	map: null,
	selectedMarker: null,
	directionsService: null,
	directionsDisplay: null,
	destinationMarker: null,
	styles: null,
	loaded: false
};

const createMarker = function(place, bounce, star){
	return new google.maps.Marker({
		map: map.map,
		icon: star ? '/assets/img/bluestar-16.png' : '/assets/img/arrow-213-16.png',
		title: place.name,
		position: place.geometry.location,
		id: place.place_id,
		vicinity: place.vicinity,
		animation: bounce ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP
	});
};

//initialize the map
function initMap(){    //jshint ignore:line
	map.loaded = true;

	map.DestInfoWindow = new google.maps.InfoWindow({
		content: null,
		maxWidth: 200
	});
	map.directionsService = new google.maps.DirectionsService();
	map.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	map.eastend = new google.maps.LatLng(
		40.44862479999999,
		-79.9578864);
	map.map = new google.maps.Map(document.getElementById('map'), {
		center: map.eastend,
		zoom: 12,
		styles: map.styles
	});
	map.service = new google.maps.places.PlacesService(map.map);
	performSearch();
}

const turnBlue = function(){
	this.icon = '/assets/img/bluearrow-213-16.png';
};

const becomeArrow = function(){
	this.icon = '/assets/img/arrow-213-16.png';
};

const makeMarkers = function(results, i){
	window.setTimeout(()=>{
		let marker = createMarker(results[i]);
    	marker.addListener('click', ()=>{
    		findBubbleTea(marker);
    	AppViewModel.selectedMuseum(marker);
   	});
   	marker.addListener('mouseover', turnBlue);
   	marker.addListener('mouseout', becomeArrow);
   	map.markerList.push(marker);
   	AppViewModel.markers.push(marker);
	}, i * 130)

};

const callback = function(results, status){

		if (status == google.maps.places.PlacesServiceStatus.OK) {
			map.places = results;
			ko.applyBindings(AppViewModel);
    		for (let i = 0; i < results.length; i++) {
    			makeMarkers(results, i);			
    		}
      		
  		} else {
  			console.log('status is ', status);
  		}
	};

const performSearch = function(){
	let request = {
		location: map.eastend,
		radius: '10000',
		type: 'museum',
	};

	map.service.nearbySearch(request, callback);
};


//finds Yelp reviews + directions
const BTcallback = function(results){
		//grab directions before/while making call to Yelp
	if (map.destinationMarker){
		map.destinationMarker.setMap(null);
	}
	
	getDirections(results[0].name);
	map.destinationMarker = createMarker(results[0], true, true);
	map.destinationMarker.addListener('click', function(){
		map.DestInfoWindow.open(map.map, map.destinationMarker);
	});
		

	//Yelp request has to be made via our server because of security, i guess
	fetch('/yelp/' + results[0].name  + '/' + results[0].vicinity, {
		method: 'get'
	}).then(function(response){
		return response.json();
		
	}).then(function(jso){
		map.DestInfoWindow.setContent(createInfoDisplay(jso));
		map.DestInfoWindow.open(map.map, map.destinationMarker);
	}) .catch((err)=>{
		console.log(err)
		map.DestInfoWindow.setContent('Could not find this location on Yelp');
		map.DestInfoWindow.open(map.map, map.destinationMarker);
	})
};


const getWikiInfo = function(marker){

	fetch('http://en.wikipedia.org/api/rest_v1/page/summary/' + marker.title, {
		method: 'get'
	}).then(function(response){
		return response.json();
	}).then(function(jso){
		AppViewModel.selectedMuseumInfo(jso);
	}).catch(err=>{
		console.log(err);
		AppViewModel.selectedMuseumInfo({
			extract_html: '<p>No Wikipedia page for this location.</p>',
		})
	})


};


//finds bubble tea by default-- user can change search term
const findBubbleTea = function(marker){
	getWikiInfo(marker);


	map.markerList.forEach(a=>{
		AppViewModel.endBouncing(a);
	});
	AppViewModel.startBouncing(marker);

	map.selectedMarker = marker;

	let request = {
		keyword: AppViewModel.searchFor(),
		location: marker.position,
		rankBy: google.maps.places.RankBy.DISTANCE
	};
	map.service.nearbySearch(request, BTcallback);
};


const getDirections = function(dest){
	let request = {
		origin: map.selectedMarker.title + ", Pittsburgh, PA",
		destination: dest + ", Pittsburgh, PA",
		travelMode: 'WALKING'
	};
	map.directionsDisplay.setMap(map.map);
	map.directionsDisplay.setPanel(document.getElementById('directionsPanel'));
	map.directionsService.route(request, function(res, status){
		if (status == 'OK'){
			map.directionsDisplay.setDirections(res);
		} else {
			//handle error
		}
	});
};




//define the view-model
const AppViewModel = new function(){  //jshint ignore:line
	this.markers = ko.observableArray();
	this.destination = ko.observable(map.destinationMarker);
	this.filtered = ko.observable(false);
	this.filterWord = ko.observable('');
	this.selectedMuseum = ko.observable(null);
	this.selectedMuseumInfo = ko.observable(null);
	this.hideMD = ko.observable(false);
	this.searchFor = ko.observable('Bubble Tea');
	this.about = ko.observable(false);
	this.weNeedFallback = ko.observable(false);
	this.hiderText = ko.observable('*hide*');
	this.visibleMuseums = ko.computed(()=>{
		if (this.filterWord()){
			let filter = this.filterWord();
			return this.markers().filter(function(a){
				if (a.title.match(new RegExp(filter, 'i'))){
					if (!a.visible) a.setVisible(true);
					return true;

				} else {
					a.setVisible(false);
					a.setAnimation(google.maps.Animation.DROP)
					return false;
				}
				
			});
		} else {
			this.markers().forEach(a=>{
				if (!a.visible){
					a.setAnimation(google.maps.Animation.DROP);
					a.setVisible(true);
				}

			})
			return this.markers();
		}
	});
	this.toggleAbout = function(){
		if (this.about()){
			this.about(false);
		} else {
			this.about(true);
		}

	};
	this.showItem = (marker) => {
		this.selectedMuseum(marker);
		findBubbleTea(marker);
	};

	this.undoFilter = function(){
		this.filtered(false);
		this.markers(map.markerList);
		this.markers().forEach(function(a){
			a.setMap(map.map);
		});
	};
	this.startBouncing = function(marker){
		marker.icon = '/assets/img/bluearrow-213-16.png';
		marker.setAnimation(google.maps.Animation.BOUNCE);
	};
	this.endBouncing = function(marker){
		marker.icon = '/assets/img/arrow-213-16.png';
		marker.setAnimation(null);
	};
	this.hideElement = function(){
		if (this.hideMD()) {
			this.hiderText('*hide*')
			this.hideMD(false);
		} else {
			this.hideMD(true);
			this.hiderText('*show*')
		}
	};
	this.slideUp = (data, event)=>{
		let h = event.target.parentNode.style.height;
		event.target.parentNode.style.height = h == "12px" ? "33vh" : "12px";
		if (this.sliderText() == '▼'){
			this.sliderText('▲')
		} else {
			this.sliderText('▼');
		}
	};
	this.sliderText = ko.observable('▲');

};


const createInfoDisplay = function(response){
	let header = "<h4>" + response.name + "</h4>";
	let photo = "<img class='infoWindowImg' src='" + response.image_url + "'>";
	let open = response.is_closed ? '<strong>Currently Closed. </strong><br>' : '<strong>Open Now. </strong><br>';
	let address = response.location.display_address.join(' ') + ".<br> ";
	let rating = "Rated " + response.rating + " on Yelp with <a target='_blank' href='" + response.url + "'> (" + response.review_count + ") reviews </a>";
	return header + photo + open + address + rating;

};
    		


const showFallback = function(){ //jshint ignore: line
	AppViewModel.weNeedFallback(true);
	ko.applyBindings(AppViewModel);
};