var restify = require('restify');
var mongojs = require('mongojs');

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
	else {
		db.books.findOne({_id: mongojs.ObjectId(req.params.id)},function(err, docs) {
	    	res.send(docs);
		});
	}
	return next();
});

server.post('/book', function(req, res, next) {
	console.log(req.params);
	res.send("done");
	return next();
});

server.listen(8080);