var appData = {};

appData.apiURL = 'http://localhost:8080';
appData.getBook = function(bookId) {
	$.getJSON(appData.apiURL+'/book/'+bookId, function(data) {
		console.log(data);
	});
};