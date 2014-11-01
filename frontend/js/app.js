var app = {};

/**
 * 
 */
app.run = function(settingsObj) {
    
    appMap.createMap("map");

    // confuguration
    appData.apiURL = settingsObj['appData']['apiURL'];

    appData.getBook('54540dcce3118013501512b0', function(data) {

        var mapOptions = {
            center: new google.maps.LatLng(data.events[0].location.lat, data.events[0].location.lon),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        appMap.map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        var createObjectsInBounds = function(map, lowerBound, upperBound) {
            var coordinates = [];
            for(var i = 0; i < data.events.length; i++) {
        var currentEvent = data.events[i];
        if (currentEvent.characterCount >= lowerBound && currentEvent.characterCount <= upperBound) {

            appMap.addObject(new google.maps.Marker({
                position: new google.maps.LatLng(currentEvent.location.lat, currentEvent.location.lon)
            }));

            coordinates.push(new google.maps.LatLng(currentEvent.location.lat, currentEvent.location.lon));
        }
    }

    appMap.addObject(new google.maps.Polyline({
            path: coordinates,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
        }));
    };
    createObjectsInBounds(map, data.events[0].characterCount, data.events[data.events.length - 1].characterCount);


    $("#pageline-slider").rangeSlider({
        step: 1,
        bounds: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount},
        defaultValues: {min: data.events[0].characterCount, max: data.events[data.events.length - 1].characterCount}
    });
    $('#pageline-slider').bind('valuesChanging', function (e, data) {
        appMap.clearMap();
        createObjectsInBounds(map, data.values.min, data.values.max);
    });
    
    
    // Initialize jQuery slider
//            $("#timeline-sider").dateRangeSlider();
//
//            // @TODO: use data 
//            $("#timeline-slider").dateRangeSlider("option", "bounds", {
//                min: new Date(2012, 0, 1),
//                max: new Date(2012, 11, 31)
//            });
    
});
    
};

