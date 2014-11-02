var appTimeline = {};


appTimeline.events = [];
appTimeline.begin = 0;
appTimeline.end = 0;

appTimeline.addEvent = function(time, color, position) {
	appTimeline.events.push(time);

	var timeline = $('#timeline-wrapper');
	var $element = $('<div class="eventBox"></div>').css('background', color).css({left: (time-appTimeline.begin)/(appTimeline.end-appTimeline.begin)*100 + '%'}).appendTo(timeline);


	var eventCount = _.filter(appTimeline.events, function(timestamp) {
		return timestamp == time;
	}).length;

	$element.css('bottom', 3*eventCount + 'px');
	$element.click(function() {
		appMap.map.setCenter(position);
	});
};

appTimeline.clear = function() {
	appTimeline.events = [];
	$('#timeline-wrapper').empty();
};