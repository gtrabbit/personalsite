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

}


//initialize the map
function initMap(){
	map.loaded = true;

	map.DestInfoWindow = new google.maps.InfoWindow({
		content: null,
		maxWidth: 200
	});
	map.directionsService = new google.maps.DirectionsService();
	map.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	
	map.eastend = new google.maps.LatLng(
		40.44862479999999,
		-79.9578864)
	map.map = new google.maps.Map(document.getElementById('map'), {
		center: map.eastend,
		zoom: 12,
		styles: map.styles
	});
	map.service = new google.maps.places.PlacesService(map.map);
	performSearch()
}


const performSearch = function(){
	let request = {
		location: map.eastend,
		radius: '10000',
		type: 'museum',
	}
	const callback = function(results, status){

		if (status == google.maps.places.PlacesServiceStatus.OK) {
			map.places = results;
			ko.applyBindings(AppViewModel);
    		for (let i = 0; i < results.length; i++) {
    			window.setTimeout(function(){
    				let marker = createMarker(results[i]);
    				marker.addListener('click', ()=>{
    					findBubbleTea(marker);
    					AppViewModel.selectedMuseum(marker);
    				})
    				marker.addListener('mouseover', 
    					function(){
    						marker.icon = '/assets/img/bluearrow-213-16.png'
    					})
    				marker.addListener('mouseout', function(){
    					marker.icon = '/assets/img/arrow-213-16.png'
    				})
      				map.markerList.push(marker);
      				AppViewModel.markers.push(marker);
      				// if (i+1 == results.length){
      				// 	ko.applyBindings(AppViewModel);  //there should be a better place for this...
      				// }
    			}, i * 130)			
    		}
      		
  		} else {
  			console.log('status is ', status)
  		}
	}

	map.service.nearbySearch(request, callback)
}


//finds Yelp reviews + directions
const BTcallback = function(results, status){
		//grab directions before/while making call to Yelp
	if (map.destinationMarker){
		map.destinationMarker.setMap(null);
	}
	
	getDirections(results[0].name)
	map.destinationMarker = createMarker(results[0], true, true);
	map.destinationMarker.addListener('click', function(){
		map.DestInfoWindow.open(map.map, map.destinationMarker)
	})
		//Yelp request has to be made via our server because of security, i guess
	let xhr = new XMLHttpRequest()
	xhr.open('GET', '/yelp/' + results[0].name + '/' + results[0].vicinity)
	xhr.send()
	xhr.onreadystatechange = function(){
		if (xhr.readyState == XMLHttpRequest.DONE){
			if (xhr.status === 200){
				let response = null;
				//check if we got a response
				if (xhr.responseText){
					response = JSON.parse(xhr.responseText);
					map.DestInfoWindow.setContent(createInfoDisplay(response));
					map.DestInfoWindow.open(map.map, map.destinationMarker);
				}
			}	
		}
	}
}


const getWikiInfo = function(marker){
	xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://en.wikipedia.org/api/rest_v1/page/summary/' + marker.title)
	//xhr.setRequestHeader('Api-User-Agent', 'www.chrisrune.com')
	xhr.send()
	xhr.onreadystatechange = function(){
		if (xhr.readyState == XMLHttpRequest.DONE){
			if (xhr.status === 200){
				let response = null;
				//check if we got a response
				if (xhr.responseText){
					response = JSON.parse(xhr.responseText);
					
				}
				AppViewModel.selectedMuseumInfo(response);
			} else {
				AppViewModel.selectedMuseumInfo(null);
			}	
		}
	}
}


//finds bubble tea by default-- user can change search term
const findBubbleTea = function(marker){
	getWikiInfo(marker);


	map.markerList.forEach(a=>{
		AppViewModel.endBouncing(a);
	})
	AppViewModel.startBouncing(marker);

	map.selectedMarker = marker;

	request = {
		keyword: document.getElementById('afterward').value,
		location: marker.position,
		rankBy: google.maps.places.RankBy.DISTANCE
	}
	map.service.nearbySearch(request, BTcallback)
}


const getDirections = function(dest){
	let request = {
		origin: map.selectedMarker.title + ", Pittsburgh, PA",
		destination: dest + ", Pittsburgh, PA",
		travelMode: 'WALKING'
	}
	map.directionsDisplay.setMap(map.map)
	map.directionsDisplay.setPanel(document.getElementById('directionsPanel'));
	map.directionsService.route(request, function(res, status){
		if (status == 'OK'){
			map.directionsDisplay.setDirections(res);
		} else {
			//handle error
		}
	})
}


const createMarker = function(place, bounce, star){
	return new google.maps.Marker({
		map: map.map,
		icon: star ? '/assets/img/bluestar-16.png' : '/assets/img/arrow-213-16.png',
		title: place.name,
		position: place.geometry.location,
		id: place.place_id,
		vicinity: place.vicinity,
		animation: bounce ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP
	})
}

//define the view-model
const AppViewModel = {
	markers: ko.observableArray(),
	destination: ko.observable(map.destinationMarker),
	filtered: ko.observable(false),
	selectedMuseum: ko.observable(null),
	selectedMuseumInfo: ko.observable(null),
	hideMD: ko.observable(false),
	searchFor: ko.observable('Bubble Tea'),
	about: ko.observable(false),
	weNeedFallback: ko.observable(false),
	toggleAbout: function(){
		this.about() ? this.about(false) : this.about(true);
	},
	showItem: (marker) => {
		AppViewModel.selectedMuseum(marker);
		findBubbleTea(marker);
	},
	filterResults: function(formEl){
		if (this.filtered()){
			this.undoFilter();
		}

		this.filtered(true);
		term = new RegExp(formEl.filter.value, ['i']);
		this.markers().forEach(function(a){
			a.setAnimation(google.maps.Animation.DROP)
		})
		this.markers(this.markers().filter(function(a){
			if (!a.title.match(term)){
				a.setMap(null);
				return false;
			} else {
				return true;
			}
		}))
	},
	undoFilter: function(){
		this.filtered(false);
		this.markers(map.markerList)
		this.markers().forEach(function(a){
			a.setMap(map.map);
		})
	},
	startBouncing: function(marker){
		marker.icon = '/assets/img/bluearrow-213-16.png'
		marker.setAnimation(google.maps.Animation.BOUNCE);
	},
	endBouncing: function(marker){
		marker.icon = '/assets/img/arrow-213-16.png'
		marker.setAnimation(null);
	},
	hideElement: function(e){
		this.hideMD() ? this.hideMD(false) : this.hideMD(true);	
	}

}

const createInfoDisplay = function(response){
	let header = "<h4>" + response.name + "</h4>";
	let photo = "<img class='infoWindowImg' src='" + response.image_url + "'>";
	let open = response.is_closed ? '<strong>Currently Closed. </strong><br>' : '<strong>Open Now. </strong><br>';
	let address = response.location.display_address.join(' ') + ".<br> ";
	let rating = "Rated " + response.rating + " on Yelp with <a target='_blank' href='" + response.url + "'> (" + response.review_count + ") reviews </a>";
	return header + photo + open + address + rating;

}
    		


const showFallback = function(){
		document.getElementById('GMfallback').style.display = 'block'
	}

