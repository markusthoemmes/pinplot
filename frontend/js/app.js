var app = {};

/**
 * 
 */
app.run = function(settingsObj) {
    
    // confuguration
    appData.apiURL = settingsObj.appData.apiURL;

    appData.getBook('5454e93fe3118013501512b2', function(data) {

    	var characters = _.map(data.events, function(event) {
    		return _.pluck(event.involved, 'name');
    	});
    	characters = _.unique(_.flatten(characters));

    	var filterCharacters = characters;

    	var $characters = $('#character-container');
    	_.each(characters, function(character) {
    		var $character = $('<div><span class="label">'+character+'</span><input name="character[]" type="checkbox" checked value="'+character+'">');
    		$character.appendTo($characters);
    	});

        appMap.createMap("map", {
            center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon)
        });

        var createObjects = function(map, characters, events) {
	        _.each(characters, function(character) {
	        	var charEvents = _.filter(events, function(event) {
	        		return _.contains(_.pluck(event.involved, 'name'), character);
	        	});

	        	var coordinates = [];
	        	_.each(charEvents, function(event) {
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

	    createObjects(map, filterCharacters, data.events);


	    var pagelineSlider = $("#pageline-slider").rangeSlider({
	        step: 1,
	        bounds: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount},
	        defaultValues: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount}
	    });
	    pagelineSlider.bind('valuesChanging', function (e, sliderData) {
	        appMap.clearMap();

	        var events = helper.filterEvents(data.events, filterCharacters, 'characterCount', sliderData.values.min, sliderData.values.max);
	        createObjects(map, filterCharacters, events);
	    
	        timelineSlider.dateRangeSlider('min', new Date(events[0].timestamp*1000));
	        timelineSlider.dateRangeSlider('max', new Date(events[events.length - 1].timestamp*1000));
	    });

	    var timelineSlider = $('#timeline-slider').dateRangeSlider({
	    	step: {days: 1},
	    	bounds: {min: new Date((data.events[0].timestamp-86400)*1000), max: new Date((data.events[data.events.length - 1].timestamp+86400)*1000)},
	    	defaultValues: {min: new Date((data.events[0].timestamp-86400)*1000), max: new Date((data.events[data.events.length - 1].timestamp+86400)*1000)}
	    });

	    timelineSlider.bind('valuesChanging', function(e, sliderData) {
	    	appMap.clearMap();
	    	var events = helper.filterEvents(data.events, filterCharacters, 'timestamp', sliderData.values.min, sliderData.values.max);
	    	createObjects(map, filterCharacters, events);

	    	pagelineSlider.rangeSlider('min', events[0].characterCount);
	    	pagelineSlider.rangeSlider('max', events[events.length-1].characterCount);
	    });

	    $characters.on('change', 'input', function() {
	    	filterCharacters = [];
	    	$characters.find('input').each(function() {
	    		if($(this).prop('checked') === true) {
	    			filterCharacters.push($(this).val());
	    		}
	    	});

	    	appMap.clearMap();
	        var events = helper.filterEvents(data.events, filterCharacters, 'characterCount', pagelineSlider.rangeSlider('min'), pagelineSlider.rangeSlider('max'));

	        createObjects(map, filterCharacters, events);
	    });
	});
    
};

var helper = {};

helper.filterEvents = function(events, characters, property, lowerBound, upperBound) {
	return _.filter(events, function(event) {
		if(property === 'timestamp') {
			return _.intersection(_.pluck(event.involved, 'name'), characters).length > 0 && new Date(event[property]*1000) >= lowerBound && new Date(event[property]*1000) <= upperBound;
		}
		else {
	    	return _.intersection(_.pluck(event.involved, 'name'), characters).length > 0 && event[property] >= lowerBound && event[property] <= upperBound;
		}
	});
};