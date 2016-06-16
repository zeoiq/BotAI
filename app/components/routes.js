var TwitterLink = require('../models/twitterLink');

module.exports = function(app) {
    // Add headers
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8383');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });
    
	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/twitterLink', function(req, res) {
		// use mongoose to get all todos in the database
		TwitterLink.find(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(data); // return all todos in JSON format
		});
	});

	// create todo and send back all todos after creation
	app.post('/api/twitterLink', function(req, res) {
        var data = JSON.parse(req.query.twitterLinkData);

		// create a todo, information comes from AJAX request from Angular
		TwitterLink.create({
            twitterName : data.twitterName,
            tweetsLink : data.tweetsLink,
            tweetsRepliesLink : data.tweetsRepliesLink
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			TwitterLink.find(function(err, todos) {
				if (err)
					res.send(err);
				res.json(todos);
			});
		}); 

	});
    
    // create todo and send back all todos after creation
	app.put('/api/twitterLink', function(req, res) {
        var twitterLinkData = JSON.parse(req.query.twitterLinkData);
        //console.log(data);  
        // get a user with ID of 1
        TwitterLink.findById(twitterLinkData.id, function(err, twitterlink) {
            if (err) throw err;

            twitterlink.twitterName = twitterLinkData.twitterName;
            twitterlink.tweetsLink = twitterLinkData.tweetsLink;
            twitterlink.tweetsRepliesLink = twitterLinkData.tweetsRepliesLink;

            // save the twitterlink
            twitterlink.save(function(err) {
                if (err) throw err;
                
                // get and return all the todos after you create another
                TwitterLink.find(function(err, data) {
                    if (err)
                        res.send(err);
                    res.json(data);
                });
            });
        });
	});

	// delete a todo
	app.delete('/api/twitterLink/:twitterlink_id', function(req, res) {
		TwitterLink.remove({
			_id : req.params.twitterlink_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			TwitterLink.find(function(err, data) {
				if (err)
					res.send(err);
				res.json(data);
			});
		});
	});
};
 