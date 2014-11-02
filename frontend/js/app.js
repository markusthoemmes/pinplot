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

    var byTimestamp = _.sortBy(data.events, function(event) {
        return event.timestamp;
    });

	var characters = _.map(data.events, function(event) {
		return _.pluck(event.involved, 'name');
	});
	characters = _.unique(_.flatten(characters));

	var filterCharacters = characters;
	var timelineData;
    var characterColors = {};

	var $characters = $('#character-container');
	_.each(characters, function(character, i) {
        var baseColor = {
            hue: 0,
            saturation: 59,
            brightness: 45
        };
        if(characterColors[character] === undefined) {
            characterColors[character] = 'hsl('+(baseColor.hue+(280/characters.length)*i)+', '+baseColor.saturation+'%, '+baseColor.brightness+'%)';
        }
		var $character = $('<div><label class="checked" for="character-'+i+'">'+character+'<input name="character[]" id="character-'+i+'" type="checkbox" checked value="'+character+'"></label>');
		$character.appendTo($characters);
        $character.find('label').css('background', characterColors[character]);
	});

    if(data.name === 'Der Herr der Ringe') {
        appMap.createHDRMap("map", {
            center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon)
        });
    }
    else {
        appMap.createMap("map", {
            center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon)
        });
    }

    appTimeline.begin = byTimestamp[0].timestamp;
    appTimeline.end = byTimestamp[byTimestamp.length-1].timestamp;

    // Create map pins
    var createObjects = function(map, characters, events) {
        appTimeline.clear();
        _.each(characters, function(character) {
        	var charEvents = _.filter(events, function(event) {
        		return _.contains(_.pluck(event.involved, 'name'), character);
        	});

        	charEvents = _.sortBy(charEvents, function(event) {
        		return event.timestamp;
        	});


        	var coordinates = [];
        	_.each(charEvents, function(event) {

                var mood = "neutral";
                if(_.find(event.involved, {name: character}).mood) {
                    mood = _.find(event.involved, {name: character}).mood;
                }
        		appMap.addObject(new google.maps.Marker({
	                position: new google.maps.LatLng(event.location.lat, event.location.lon),
                    icon: pinSymbol(characterColors[character], mood)
	            }));

                var nthCharacter = _.indexOf(_.pluck(event.involved, 'name'), character);
	            coordinates.push(new google.maps.LatLng(event.location.lat+(0.05*nthCharacter), event.location.lon-(0.05*nthCharacter)));

                appTimeline.addEvent(event.timestamp, characterColors[character], new google.maps.LatLng(event.location.lat, event.location.lon));
        	});

        	appMap.addObject(new google.maps.Polyline({
	            path: coordinates,
	            strokeColor: characterColors[character],
	            strokeOpacity: 1.0,
	            strokeWeight: 3,
	            geodesic: true
	        }));
        });

      	/*timelineData = new vis.DataSet({});
        for(var i = 0; i < events.length; i++) {
        	timelineData.add([{id:i, start: new Date(events[i].timestamp*1000), model: events[i]}]);
        }
        timeline.setItems(timelineData);*/
    };

    /*timelineData = new vis.DataSet({});
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
    });*/

    createObjects(map, filterCharacters, data.events);


    $('#pageline-begin').text('page '+data.events[0].characterCount);
    $('#pageline-end').text('page '+data.events[data.events.length-1].characterCount);

    var timelineBegin = new Date(byTimestamp[0].timestamp*1000);
    var timelineEnd = new Date(byTimestamp[byTimestamp.length-1].timestamp*1000);

    var monthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    $('#timeline-begin').text(monthNames[timelineBegin.getMonth()]+" "+timelineBegin.getFullYear());
    $('#timeline-end').text(monthNames[timelineEnd.getMonth()]+" "+timelineEnd.getFullYear());

    /*timeline.on('select', function(item) {
    	if(item.items.length > 0) {
    		var event = timelineData.get(item.items[0]).model;
    		appMap.map.setCenter(new google.maps.LatLng(event.location.lat, event.location.lon));
    	}
    });*/


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
    			$(this).parent().addClass('checked').css('background', characterColors[$(this).val()]);
    		}
    		else {
    			$(this).parent().removeClass('checked').css('background', 'rgba(255, 255, 255, 0.6)');
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
    $('#character-container, #timeline-wrapper, #map').empty();
    
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

helper.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

function pinSymbol(color, mood) {
    var paths = {
        happy: "M0.4-14.9c5.2-7.6,12.9-17.1,12.9-28.2c0-8-5.8-14.5-13.1-14.5c-7.2,0-13.1,6.5-13.1,14.5 c0,11.1,7.3,20.7,12.5,28.1l0.1,0.8c-2.4,3.6-4.2,6.8-4.2,9.6C-4.3-2.1-2.3,0,0.3,0c2.5,0,4.6-2.1,4.6-4.6c0-2.6-2-5.8-4.6-9.6 L0.4-14.9z M3.6-40.4c1.3,0,2.3,1.2,2.3,2.8s-1,2.8-2.3,2.8s-2.3-1.2-2.3-2.8S2.3-40.4,3.6-40.4z M-7.3-37.6c0-1.5,1-2.8,2.3-2.8 s2.3,1.2,2.3,2.8s-1,2.8-2.3,2.8S-7.3-36.1-7.3-37.6z M-4-27.9c-0.4-0.4-0.4-1,0-1.4c0.4-0.4,1-0.4,1.4,0c0.7,0.7,1.8,1.5,2.8,1.4 c1.1-0.1,2-1.3,2.6-2.2c0.3-0.5,0.9-0.6,1.4-0.3c0.5,0.3,0.6,0.9,0.3,1.4c-1.1,1.9-2.5,3-4.1,3.2c-0.1,0-0.3,0-0.5,0 C-1-25.9-2.4-26.3-4-27.9z",
        neutral: 'M-0.1-14.2c-2.4,3.6-4.2,6.8-4.2,9.6C-4.3-2.1-2.3,0,0.3,0c2.5,0,4.6-2.1,4.6-4.6c0-2.6-2-5.8-4.6-9.6 l0.1-0.7c5.2-7.6,12.9-17.1,12.9-28.2c0-8-5.8-14.5-13.1-14.5c-7.2,0-13.1,6.5-13.1,14.5c0,11.1,7.3,20.7,12.5,28.1L-0.1-14.2z M-7.1-37.3c0-1.3,1-2.3,2.3-2.3s2.3,1,2.3,2.3s-1,2.3-2.3,2.3S-7.1-36-7.1-37.3z M3.9-28h-7c-0.6,0-1-0.4-1-1s0.4-1,1-1h7 c0.6,0,1,0.4,1,1S4.5-28,3.9-28z M5.8-35c-1.3,0-2.3-1-2.3-2.3s1-2.3,2.3-2.3s2.3,1,2.3,2.3S7.1-35,5.8-35z',
        dead: "M0.4-14.9c5.2-7.6,12.9-17.1,12.9-28.2c0-8-5.8-14.5-13.1-14.5c-7.2,0-13.1,6.5-13.1,14.5 c0,11.1,7.3,20.7,12.5,28.1l0.1,0.8c-2.4,3.6-4.2,6.8-4.2,9.6C-4.3-2.1-2.3,0,0.3,0c2.5,0,4.6-2.1,4.6-4.6c0-2.6-2-5.8-4.6-9.6 L0.4-14.9z M2.1-38.5c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.8,1.8L7-40c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.8,1.8L8.5-35 c0.4,0.4,0.4,1,0,1.4c-0.2,0.2-0.5,0.3-0.7,0.3S7.2-33.4,7-33.6l-1.8-1.8l-1.8,1.8c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3 c-0.4-0.4-0.4-1,0-1.4l1.8-1.8L2.1-38.5z M-1.5-34c0.4,0.4,0.4,1,0,1.4c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3l-1.8-1.8 l-1.8,1.8c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.8-1.8l-1.8-1.8c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0 l1.8,1.8L-3-39c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.8,1.8L-1.5-34z",
        sad: "M0.4-14.9c5.2-7.6,12.9-17.1,12.9-28.2c0-8-5.8-14.5-13.1-14.5c-7.2,0-13.1,6.5-13.1,14.5 c0,11.1,7.3,20.7,12.5,28.1l0.1,0.8c-2.4,3.6-4.2,6.8-4.2,9.6C-4.3-2.1-2.3,0,0.3,0c2.5,0,4.6-2.1,4.6-4.6c0-2.6-2-5.8-4.6-9.6 L0.4-14.9z M5.4-38.6c0.8,0,1.5,0.8,1.5,1.8c0,1-0.7,1.8-1.5,1.8c-0.8,0-1.5-0.8-1.5-1.8C3.9-37.8,4.6-38.6,5.4-38.6z M-5.3-34.9 c-0.8,0-1.5-0.8-1.5-1.8c0-1,0.7-1.8,1.5-1.8s1.5,0.8,1.5,1.8C-3.8-35.7-4.4-34.9-5.3-34.9z M-2.7-25.2c0,0.6-0.4,1.1-1,1.1 s-1-0.6-1-1.2c0-1.8,1.6-3.8,4.3-3.8c0,0,0,0,0,0c2.9,0,4.3,2,4.7,3.6c0.1,0.5-0.3,1.2-0.8,1.3c-0.1,0-0.1,0.1-0.2,0.1 c-0.5,0-0.9-0.6-1-1c-0.1-0.5-0.6-2-2.7-2c0,0,0,0,0,0C-2-27-2.7-25.8-2.7-25.2z"
    };
    return {
        path: paths[mood],
        fillColor: color,
        fillOpacity: 1,
        strokeColor: 'rgba(0, 0, 0, 0.6)',
        strokeWeight: 2,
        scale:1,
   };
}