var appMap = {};
appMap.map = null;
appMap.objects = [];

appMap.createMap = function(id) {
	var styles = [
	  {
	    "featureType": "landscape.natural",
	    "stylers": [
	      { "visibility": "on" },
	      { "color": "#808080" },
	      { "lightness": -26 },
	      { "gamma": 0.66 }
	    ]
	  },{
	    "featureType": "road",
	    "stylers": [
	      { "visibility": "on" },
	      { "saturation": -79 },
	      { "lightness": -34 },
	      { "hue": "#005eff" }
	    ]
	  },{
	    "featureType": "water",
	    "stylers": [
	      { "lightness": -51 },
	      { "gamma": 0.38 },
	      { "saturation": -88 }
	    ]
	  },{
	    "featureType": "landscape.man_made",
	    "elementType": "geometry",
	    "stylers": [
	      { "color": "#fbef69" }
	    ]
	  },{
	    "elementType": "labels.text.stroke",
	    "stylers": [
	      { "lightness": 17 },
	      { "color": "#fbef69" },
	      { "saturation": -37 }
	    ]
	  },{
	    "featureType": "poi",
	    "stylers": [
	      { "weight": 0.6 },
	      { "color": "#808080" },
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.land_parcel"  }
	];

	var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

	var mapOptions = {
		zoom: 8,
		mapTypeControlOptions: {
    		mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    	}
	};
	appMap.map = new google.maps.Map(document.getElementById(id), mapOptions);
	appMap.map.mapTypes.set('map_style', styledMap);
    appMap.map.setMapTypeId('map_style');
};

appMap.addObject = function(marker) {
	marker.setMap(appMap.map);
	appMap.objects.push(marker);
};

appMap.clearMap = function() {
	for(var i = 0; i < appMap.objects.length; i++) {
		appMap.objects[i].setMap(null);
	}
	appMap.objects = [];
};