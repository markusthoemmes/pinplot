var appMap = {};
appMap.map = null;
appMap.objects = [];

appMap.createMap = function(id, options) {
	var styles = [ { "featureType": "administrative.province", "stylers": [ { "visibility": "off" } ] },{ "featureType": "administrative.neighborhood", "stylers": [ { "visibility": "off" } ] },{ "featureType": "administrative.land_parcel", "stylers": [ { "visibility": "off" } ] },{ "featureType": "poi", "stylers": [ { "visibility": "off" } ] },{ "featureType": "road.highway", "elementType": "labels", "stylers": [ { "visibility": "off" } ] },{ "featureType": "road.arterial", "elementType": "labels", "stylers": [ { "visibility": "off" } ] },{ "featureType": "road.local", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },{ "featureType": "landscape.natural.landcover", "stylers": [ { "saturation": -20 }, { "gamma": 0.54 }, { "lightness": 42 }, { "hue": "#ff7700" } ] },{ "featureType": "water", "stylers": [ { "hue": "#ffb300" }, { "lightness": -30 }, { "saturation": -100 }, { "gamma": 0.7 } ] },{ },{ },{ "featureType": "landscape.man_made", "stylers": [ { "hue": "#ff0000" }, { "lightness": 2 }, { "saturation": 16 } ] },{ "featureType": "road", "stylers": [ { "saturation": -75 }, { "hue": "#007fff" }, { "gamma": 0.93 } ] },{ "featureType": "road.local", "stylers": [ { "hue": "#005eff" }, { "gamma": 0.88 }, { "saturation": 18 }, { "lightness": -3 }, { "weight": 0.1 } ] },{ "featureType": "road.arterial", "stylers": [ { "gamma": 1 }, { "hue": "#005eff" }, { "saturation": 13 }, { "lightness": -17 }, { "weight": 0.8 } ] },{ "featureType": "road", "elementType": "labels.text", "stylers": [ { "saturation": -69 }, { "lightness": 50 } ] },{ "featureType": "transit", "stylers": [ { "visibility": "off" } ] },{ "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "hue": "#ff7700" }, { "lightness": 14 }, { "saturation": 56 } ] },{ "featureType": "administrative" },{ "featureType": "administrative.country", "elementType": "labels.text", "stylers": [ { "hue": "#ff0000" }, { "saturation": 49 }, { "lightness": 20 }, { "weight": 1.8 } ] },{ "featureType": "water", "elementType": "labels.text", "stylers": [ { "hue": "#0000ff" }, { "weight": 0.1 }, { "lightness": 17 }, { "saturation": 25 } ] },{ } ];

	var mapOptions = {
		center: new google.maps.LatLng(1, 1),
		zoom: 8,
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
    	styles: styles
	};
	appMap.map = new google.maps.Map(document.getElementById(id), $.extend({}, mapOptions, options));
	appMap.map.setOptions({styles: styles});
};

appMap.createHDRMap = function(id, options) {
	var meType = {
		getTileUrl: function(coord, zoom) {
			if(coord.y < 0 || coord.x < 0) return null;
			return 'http://images1.fanpop.com/images/photos/2300000/Map-of-Middle-Earth-lord-of-the-rings-2329809-1600-1200.jpg';
		},
		tileSize: new google.maps.Size(1600, 1200),
		maxZoom: 5,
		minZoom: 5,
		radius: 1738000,
		name: 'Middle Earth'
	};

	var meMapType = new google.maps.ImageMapType(meType);

	var mapOptions = {
		center: new google.maps.LatLng(1, 1),
		zoom: 8,
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
	};
	appMap.map = new google.maps.Map(document.getElementById(id), $.extend({}, mapOptions, options));

	appMap.map.mapTypes.set('middle-earth', meMapType);
  	appMap.map.setMapTypeId('middle-earth');
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