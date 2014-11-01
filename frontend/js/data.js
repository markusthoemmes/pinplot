var appData = {};

appData.apiURL = 'http://localhost:8080';
appData.getBook = function(bookId, callback) {
	$.getJSON(appData.apiURL+'/book/'+bookId, function(data) {
		callback(data);
	});
};

appData.getBooks = function(callback) {
	$.getJSON(appData.apiURL+'/book/', function(data) {
		callback(data);
	});
};