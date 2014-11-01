var appMap = {};
appMap.map = null;
appMap.objects = [];

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