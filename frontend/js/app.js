var app = {};

/**
 * 
 */
app.run = function(settingsObj) {
    
    // confuguration
    appData.apiURL = settingsObj.appData.apiURL;

    appData.getBook('5454cc8ce3118013501512b1', function(data) {

    	var characters = _.map(data.events, function(event) {
    		return _.pluck(event.involved, 'name');
    	});
    	characters = _.unique(_.flatten(characters));

        appMap.createMap("map", {
            center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon)
        });

        var createObjects = function(map, characters, lowerBound, upperBound) {
	        _.each(characters, function(character) {
	        	var events = _.filter(data.events, function(event) {
	        		return _.contains(_.pluck(event.involved, 'name'), character) && event.characterCount >= lowerBound && event.characterCount <= upperBound;
	        	});

	        	var coordinates = [];
	        	_.each(events, function(event) {
	        		appMap.addObject(new google.maps.Marker({
		                position: new google.maps.LatLng(event.location.lat, event.location.lon)
		            }));

		            coordinates.push(new google.maps.LatLng(event.location.lat, event.location.lon));
	        	});

	        	appMap.addObject(new google.maps.Polyline({
		            path: coordinates,
		            strokeColor: "#FF0000",
		            strokeOpacity: 1.0,
		            strokeWeight: 2,
		            geodesic: true
		        }));
	        });
	    };

	    createObjects(map, ["Sabeth"], data.events[0].characterCount, data.events[data.events.length - 1].characterCount);


	    $("#pageline-slider").rangeSlider({
	        step: 1,
	        bounds: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount},
	        defaultValues: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount}
	    });
	    $('#pageline-slider').bind('valuesChanging', function (e, data) {
	        appMap.clearMap();
	        createObjects(map, ["Sabeth"], data.values.min, data.values.max);
	    });
	});
    
};

