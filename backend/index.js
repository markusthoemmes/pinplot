var restify = require('restify');
var mongojs = require('mongojs');
var request = require('request');

request('http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=Homo_faber_(Roman)', function(err, res, body) {
	if (!err && res.statusCode == 200) {
    	var data = JSON.parse(body);

    	var pageId;
    	for(pageId in data.query.pages) break;

    	var extract = data.query.pages[pageId].extract.match(/<p>(.*?)<\/p>/g)[0];
	}
});

var server = restify.createServer({
	name: 'StoryMapper',
});

server
	.use(restify.fullResponse())
	.use(restify.bodyParser());

server.get('/book/:id', function(req, res, next) {
	res.contentType = 'json';
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	var db = mongojs('storymapper', ['books']);

	if(req.params.id === '') {
		db.books.find(function(err, docs) {
	    	res.send(docs);
		});
	}
	return next();
});

server.listen(8080);