var app = {};

/**
 * 
 */
app.run = function(settingsObj) {
	appData.apiURL = settingsObj.appData.apiURL;
	appData.getBooks(function(books) {
		$('#search-input').typeahead({
	     	name: 'accounts',
	    	local: _.pluck(books, 'name')
	    }).on('typeahead:selected', function(e, sugg) {
	    	app.openBook(_.findWhere(books, {name: sugg.value}));
	    });
	});
};

app.openBook = function(data) {
	app.clearUI();

	data.events = _.sortBy(data.events, function(event) {
		return event.characterCount;
	});

	var characters = _.map(data.events, function(event) {
		return _.pluck(event.involved, 'name');
	});
	characters = _.unique(_.flatten(characters));

	var filterCharacters = characters;
	var timelineData;

	var $characters = $('#character-container');
	_.each(characters, function(character, i) {
		var $character = $('<div><label class="checked" for="character-'+i+'">'+character+'<input name="character[]" id="character-'+i+'" type="checkbox" checked value="'+character+'"></label>');
		$character.appendTo($characters);
	});

    appMap.createMap("map", {
        center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon)
    });

    // Create map pins
    var createObjects = function(map, characters, events) {
        _.each(characters, function(character) {
        	var charEvents = _.filter(events, function(event) {
        		return _.contains(_.pluck(event.involved, 'name'), character);
        	});

        	charEvents = _.sortBy(charEvents, function(event) {
        		return event.timestamp;
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

      	timelineData = new vis.DataSet({});
        for(var i = 0; i < events.length; i++) {
        	timelineData.add([{id:i, start: new Date(events[i].timestamp*1000), model: events[i]}]);
        }
        timeline.setItems(timelineData);
    };

    var timeline = new vis.Timeline(document.getElementById('timeline-container'));
    createObjects(map, filterCharacters, data.events);

    timeline.on('select', function(item) {
    	if(item.items.length > 0) {
    		var event = timelineData.get(item.items[0]).model;
    		appMap.map.setCenter(new google.maps.LatLng(event.location.lat, event.location.lon));
    	}
    });


    var pagelineSlider = $("#pageline-slider").rangeSlider({
        step: 1,
        bounds: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount},
        defaultValues: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount}
    });

    pagelineSlider.bind('valuesChanging', function (e, sliderData) {
        appMap.clearMap();

        var events = helper.filterEvents(data.events, filterCharacters, 'characterCount', sliderData.values.min, sliderData.values.max);
        createObjects(map, filterCharacters, events);
    });

    /*var timelineSlider = $('#timeline-slider').dateRangeSlider({
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
    });*/

    $characters.on('change', 'input', function() {
    	filterCharacters = [];
    	$characters.find('input').each(function() {
    		if($(this).prop('checked') === true) {
    			filterCharacters.push($(this).val());
    			$(this).parent().addClass('checked');
    		}
    		else {
    			$(this).parent().removeClass('checked');
    		}
    	});

    	appMap.clearMap();
        var events = helper.filterEvents(data.events, filterCharacters, 'characterCount', pagelineSlider.rangeSlider('min'), pagelineSlider.rangeSlider('max'));

        createObjects(map, filterCharacters, events);
    });
    
    
    
    // Set book name
    app.setBookName(data['name']);
    
    // Load author details
    if(data['data'] !== null && data['data']['author']) {
        
        // set author details
        app.setAuthorDetails(data['data']['author']);
    }
    
    // Load Wikipedia excerpt information
    if(data['data'] !== null && data['data']['description'] !== null && data['data']['description']['title'] !== null) {
        
        // get wikipedia data and set the book description
        appData.getWikipediaExcerpt(data['data']['description']['title'], app.setBookDescription);
    }
};

app.clearUI = function() {
    
    // 
    $('#character-container, #timeline-container, #map').empty();
    
    // 
    $('#sidebar #book-title').text("");
    
    //
    $('#sidebar #author-picture').attr('src', "");
    
    // 
    $('#sidebar #author').html("");
    
    //
    $('#panel-facts #description').html("There is no data, sorry!");
};

/**
 * 
 * @returns {undefined}
 */
app.setBookName = function(name) {
    
    $('#sidebar #book-title').text(name);
};

/**
 * 
 * @param {type} details
 * @returns {undefined}
 */
app.setAuthorDetails = function(details) {
    
    // set 
    $('#sidebar #author-picture').attr('src', details['picture']);
    
    
    var detailsHtml = "";
    
    // Add name and born data
    detailsHtml += details['name'] + "<br />Born in " + details['born'];
    
    // 
    if(details["died"] !== null) {
        
        detailsHtml += "<br />Died in " + details['death'];
    }
    
    // Set details
    $('#sidebar #author').html(detailsHtml);
};

/**
 * 
 * @param {type} description
 * @returns {undefined}
 */
app.setBookDescription = function(description) {

    // set description text
    $('#panel-facts #description').html(description);
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