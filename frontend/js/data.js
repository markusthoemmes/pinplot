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

/**
 * 
 * @param String title
 * @param Function callback
 * @returns {undefined}
 */
appData.getWikipediaExcerpt = function(title, callback) {
    
    //
    $.ajax({
        type: "GET",
        url: "http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles="+ title +"&callback=?",
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {

            console.debug(data);

            var extract = "";

            // Extract excerpt data
            for (pageId in data['query']['pages']) {

                // extract extract text
                extract = data['query']['pages'][pageId]['extract'];
                break;
            }
            
            // 
            if(extract.length > 0) {
                extract = extract.substr(3, extract.indexOf("</p>") - 4);
            }
            
            // call callback with retrieved data
            callback(extract);
        },
        error: function(errorMessage) {
            
        }
    });
};