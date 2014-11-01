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
	            geodesic: true,
	        }));
        });

      	timelineData = new vis.DataSet({});
        for(var i = 0; i < events.length; i++) {
        	timelineData.add([{id:i, start: new Date(events[i].timestamp*1000), model: events[i]}]);
        }
        timeline.setItems(timelineData);
    };

    timelineData = new vis.DataSet({});
    var timeline = new vis.Timeline(document.getElementById('timeline-wrapper'));
    timeline.setOptions({
    	height: '40px',
    	showMinorLabels: false,
    	showMajorLabels:false,
    	stack: true,
    	orientation: 'top',
    	margin: {
	        axis: 23,
	        item: {
	        	vertical:-35,
	        	horizontal:3
	        }
	    }
    });
    createObjects(map, filterCharacters, data.events);


    $('#pageline-begin').text('page '+data.events[0].characterCount);
    $('#pageline-end').text('page '+data.events[data.events.length-1].characterCount);

    var byTimestamp = _.sortBy(data.events, function(event) {
    	return event.timestamp;
    });
    var timelineBegin = new Date(byTimestamp[0].timestamp*1000);
    var timelineEnd = new Date(byTimestamp[byTimestamp.length-1].timestamp*1000);

    var monthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    $('#timeline-begin').text(monthNames[timelineBegin.getMonth()]+" "+timelineBegin.getFullYear());
    $('#timeline-end').text(monthNames[timelineEnd.getMonth()]+" "+timelineEnd.getFullYear());

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
};

app.clearUI = function() {
	$('#character-container, #timeline-wrapper, #map').empty();
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