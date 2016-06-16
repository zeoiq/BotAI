var IISLog = require('../models/iisLogStatusReport');
var IISLogErrorStatus = require('../models/iisLogErrorStatusReport');
var IISLogNoOfHitsAPI = require('../models/iisLogNoOfHitsAPIReport');
var IISLogNoOfHitsAPICIP = require('../models/iisLogNoOfHitsAPICIPReport');
var IISLogErrorStatusByAPI = require('../models/iisLogErrorStatusByAPIReport');
var IISLogErrorStatusByDateTime = require('../models/iisLogErrorStatusByDateTimeReport');
var fs = require('fs');

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
    
    /*******************************************************************************************************/
    
	// api ---------------------------------------------------------------------
	// get all IIS log status
	app.get('/api/iisLogStatus', function(req, res) {
		// use mongoose to get all IIS log status in the database
		var query = IISLog.find().sort('-dateCreated').limit(1);
        
        query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            //console.log('iisLogStatus ---> ' + JSON.stringify(data)); 
            /*fs.writeFile('app/data3.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */
			res.json(data); // return all todos in JSON format
		}); 
	});

	// create iis log status and send back all 200 after creation
	app.post('/api/iisLogStatus', function(req, res) {
        var data = req.body.LogStatus;
        //console.log('iisLogStatus ---> ' + JSON.stringify(data));         
        /*for (i = 0; i < data.length; i++) { 
            //text += data[i] + "<br>";
            console.log(data[i].aa); 
        }*/
        
        //var new_iisLogStatus = new IISLogStatusReport();
        IISLog.iisLogStatus = { iisLogStatusDetails: [] };
        IISLog.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {
            var iisLogStatusData = { apiLink: data[i].apiLink, averageTimeTaken: data[i].averageTimeTaken, 
                                  maxTimeTaken: data[i].maxTimeTaken, minTimeTaken: data[i].minTimeTaken }
            IISLog.iisLogStatus.iisLogStatusDetails.push(iisLogStatusData);
        }

		IISLog.create(IISLog, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		}); 
	});
    
    /*******************************************************************************************************/
    
	// api ---------------------------------------------------------------------
	// get all IIS log status
	app.get('/api/iisLogNoOfHitsAPI', function(req, res) {
		// use mongoose to get all IIS log status in the database
		var query = IISLogNoOfHitsAPI.find().sort('-dateCreated').limit(1);
        
        query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            //console.log('iisLogNoOfHitsAPI ---> ' + JSON.stringify(data)); 
            /*fs.writeFile('app/data3.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */
			res.json(data); // return all todos in JSON format
		}); 
	});

	// create iis log status and send back all 200 after creation
	app.post('/api/iisLogNoOfHitsAPI', function(req, res) {
        var data = req.body.LogStatus;
        //console.log('iisLogNoOfHitsAPI ---> ' + JSON.stringify(data));         
        
        IISLogNoOfHitsAPI.iisLogNoOfHitsAPI = { iisLogNoOfHitsAPIDetails: [] };
        IISLogNoOfHitsAPI.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {
            var iisLogNoOfHitsAPIData = { apiLink: data[i].apiLink, noOfHits: data[i].noOfHits }
            IISLogNoOfHitsAPI.iisLogNoOfHitsAPI.iisLogNoOfHitsAPIDetails.push(iisLogNoOfHitsAPIData);
        }

		IISLogNoOfHitsAPI.create(IISLogNoOfHitsAPI, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		}); 
	});
    
    /*******************************************************************************************************/
    
    // get all IIS log error status
	app.get('/api/iisLogErrorStatus', function(req, res) {
		// use mongoose to get all IIS log status in the database
        var query = IISLogErrorStatus.find().sort('-dateCreated').limit(1);
            
		query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            /*fs.writeFile('app/data4.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */
			res.json(data); // return all todos in JSON format
		}); 
	});
    
    // create iis log error status and send back all 200 after creation
	app.post('/api/iisLogErrorStatus', function(req, res) {
        var data = req.body.LogErrorStatus;
        //console.log('iisLogErrorStatus ---> ' + JSON.stringify(data));  
        
        IISLogErrorStatus.iisLogErrorStatus = { iisLogErrorStatusDetails: [] };
        IISLogErrorStatus.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {
            var iisLogErrorStatusData = { status: data[i].status, total: data[i].total }
            IISLogErrorStatus.iisLogErrorStatus.iisLogErrorStatusDetails.push(iisLogErrorStatusData);
        }

		IISLogErrorStatus.create(IISLogErrorStatus, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		}); 
	});
    
    /*******************************************************************************************************/
    
    app.get('/api/iisLogNoOfHitsAPICIP', function(req, res) {
		// use mongoose to get all IIS log status in the database
        /*var criteria = {'iisLogNoOfHitsAPICIP': {
          'apiLink': {
                    $in: [
                         "/UOB_OTP/otppush.aspx"
                    ]
          }
        }}; */
        var params = req.query.apiLink;

		var query = IISLogNoOfHitsAPICIP.find().sort('-dateCreated').limit(1);
        //query.populate({
        //  path: 'iisLogNoOfHitsAPICIP',
        //  match: { apiLink: "/UOB_OTP/otppush.aspx"}
        //}); 
        //query.populate( 'iisLogNoOfHitsAPICIP');//, null, { apiLink: { $in: ['/Techsupport/MFSGCIMB/BulkPush.aspx'] } } )
        //query.where('iisLogNoOfHitsAPICIP.apiLink').in(['/UOB_OTP/otppush.aspx'])
        //query.sort('-dateCreated').limit(1);
        query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            //console.log(data[0].iisLogNoOfHitsAPICIP.length);//.indexOf("/UOB_OTP/otppush.aspx"));
            //console.log('iisLogNoOfHitsAPICIP ---> ' + JSON.stringify(data)); 
            
            var dataCIP = data[0].iisLogNoOfHitsAPICIP;
            var iisLogNoOfHitsAPICIPDetails = [];
            for (var i = 0; i < dataCIP.length; i++) {
                if(dataCIP[i].apiLink == params){
                    iisLogNoOfHitsAPICIPDetails = dataCIP[i].iisLogNoOfHitsAPICIPDetails;
                    break;
                }
                    
            }
            /*fs.writeFile('app/data3.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */
			res.json(iisLogNoOfHitsAPICIPDetails); // return all todos in JSON format
		}); 
	});

	// create iis log status and send back all 200 after creation
	app.post('/api/iisLogNoOfHitsAPICIP', function(req, res) {
        var data = req.body.LogStatus;
        //console.log('iisLogNoOfHitsAPI ---> ' + JSON.stringify(data));         
        
        IISLogNoOfHitsAPICIP.iisLogNoOfHitsAPICIP = []; 
        IISLogNoOfHitsAPICIP.iisLogNoOfHitsAPICIP.iisLogNoOfHitsAPICIPDetails = [];        
         
        IISLogNoOfHitsAPICIP.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {            
            var dataDetails = data[i].LogStatus;
            var iisLogNoOfHitsAPICIPDataDetails = [];
            
            for (var x = 0; x < dataDetails.length; x++) {
                var iisLogNoOfHitsAPICIPDataDetail = { sourceIP: dataDetails[x].sourceIP, noOfHits: dataDetails[x].noOfHits };                
                iisLogNoOfHitsAPICIPDataDetails.push(iisLogNoOfHitsAPICIPDataDetail);
            }
            var iisLogNoOfHitsAPICIPData = { apiLink: data[i].apiLink, iisLogNoOfHitsAPICIPDetails: iisLogNoOfHitsAPICIPDataDetails };
            IISLogNoOfHitsAPICIP.iisLogNoOfHitsAPICIP.push(iisLogNoOfHitsAPICIPData);
        }

        //console.log('iisLogNoOfHitsAPICIP ---> ' + JSON.stringify(IISLogNoOfHitsAPICIP.iisLogNoOfHitsAPICIP));  
		IISLogNoOfHitsAPICIP.create(IISLogNoOfHitsAPICIP, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		});
	});
    
    /*******************************************************************************************************/
    
    app.get('/api/iisLogErrorStatusByAPI', function(req, res) {
		// use mongoose to get all IIS log status in the database
        var params = req.query.errorCode;

		var query = IISLogErrorStatusByAPI.find().sort('-dateCreated').limit(1);
        query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            //console.log(data[0].iisLogErrorStatusByAPI.length);//.indexOf("/UOB_OTP/otppush.aspx"));
            //console.log('iisLogErrorStatusByAPI ---> ' + JSON.stringify(data)); 
            
            var dataCIP = data[0].iisLogErrorStatusByAPI;
            var iisLogErrorStatusByAPIDetails = [];
            for (var i = 0; i < dataCIP.length; i++) {
                if(dataCIP[i].errorCode == params){
                    iisLogErrorStatusByAPIDetails = dataCIP[i].iisLogErrorStatusByAPIDetails;
                    break;
                }
                    
            }
            /*fs.writeFile('app/data3.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) */
			res.json(iisLogErrorStatusByAPIDetails); // return all todos in JSON format
		}); 
	});

	// create iis log status and send back all 200 after creation
	app.post('/api/iisLogErrorStatusByAPI', function(req, res) {
        var data = req.body.LogStatus;
        //console.log('iisLogErrorStatusByAPI ---> ' + JSON.stringify(data));         
        
        IISLogErrorStatusByAPI.iisLogErrorStatusByAPI = []; 
        IISLogErrorStatusByAPI.iisLogErrorStatusByAPI.iisLogErrorStatusByAPIDetails = [];        
         
        IISLogErrorStatusByAPI.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {            
            var dataDetails = data[i].LogStatus;
            var iisLogErrorStatusByAPIDataDetails = [];
            
            for (var x = 0; x < dataDetails.length; x++) {
                var iisLogErrorStatusByAPIDataDetail = { apiLink: dataDetails[x].apiLink, noOfHits: dataDetails[x].noOfHits };                
                iisLogErrorStatusByAPIDataDetails.push(iisLogErrorStatusByAPIDataDetail);
            }
            var iisLogErrorStatusByAPIData = { errorCode: data[i].errorCode, iisLogErrorStatusByAPIDetails: iisLogErrorStatusByAPIDataDetails };
            IISLogErrorStatusByAPI.iisLogErrorStatusByAPI.push(iisLogErrorStatusByAPIData);
        }

        //console.log('iisLogErrorStatusByAPI ---> ' + JSON.stringify(IISLogErrorStatusByAPI.iisLogErrorStatusByAPI));  
		IISLogErrorStatusByAPI.create(IISLogErrorStatusByAPI, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		});
	});
    
    /*******************************************************************************************************/
    
    app.get('/api/iisLogErrorStatusByDateTime', function(req, res) {
        // use mongoose to get all IIS log status in the database
        var query = IISLogErrorStatusByDateTime.find().sort('-dateCreated').limit(1);
            
		query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            fs.writeFile('app/data3.json', JSON.stringify(data, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            }) 
            
			res.json(data); // return all todos in JSON format
		}); 
        
		// use mongoose to get all IIS log status in the database
        /*var params = req.query.timeStamp;

		var query = IISLogErrorStatusByDateTime.find().sort('-dateCreated').limit(1);
        query.exec(function(err, data) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

            //console.log(data[0].iisLogErrorStatusByDateTime.length);//.indexOf("/UOB_OTP/otppush.aspx"));
            //console.log('iisLogErrorStatusByDateTime ---> ' + JSON.stringify(data)); 
            
            var dataCIP = data[0].iisLogErrorStatusByDateTime;
            var iisLogErrorStatusByDateTimeDetails = [];
            for (var i = 0; i < dataCIP.length; i++) {
                if(dataCIP[i].timeStamp == params){
                    iisLogErrorStatusByDateTimeDetails = dataCIP[i].iisLogErrorStatusByDateTimeDetails;
                    break;
                }
                    
            }
			res.json(iisLogErrorStatusByDateTimeDetails); // return all todos in JSON format
		}); */
	});

	// create iis log status and send back all 200 after creation
	app.post('/api/iisLogErrorStatusByDateTime', function(req, res) {
        var data = req.body.LogStatus;
        //console.log('iisLogErrorStatusByDateTime ---> ' + JSON.stringify(data));         
        
        IISLogErrorStatusByDateTime.iisLogErrorStatusByDateTime = []; 
        IISLogErrorStatusByDateTime.iisLogErrorStatusByDateTime.iisLogErrorStatusByDateTimeDetails = [];        
         
        IISLogErrorStatusByDateTime.serverName = req.body.serverName;
        for (var i = 0; i < data.length; i++) {            
            var dataDetails = data[i].LogStatus;
            var iisLogErrorStatusByDateTimeDataDetails = [];
            
            for (var x = 0; x < dataDetails.length; x++) {
                var iisLogErrorStatusByDateTimeDataDetail = { status: dataDetails[x].status, noOfHits: dataDetails[x].noOfHits };                
                iisLogErrorStatusByDateTimeDataDetails.push(iisLogErrorStatusByDateTimeDataDetail);
            }
            var iisLogErrorStatusByDateTimeData = { timeStamp: data[i].timeStamp, iisLogErrorStatusByDateTimeDetails: iisLogErrorStatusByDateTimeDataDetails };
            IISLogErrorStatusByDateTime.iisLogErrorStatusByDateTime.push(iisLogErrorStatusByDateTimeData);
        }

        //console.log('iisLogErrorStatusByDateTime ---> ' + JSON.stringify(IISLogErrorStatusByDateTime.iisLogErrorStatusByDateTime));  
		IISLogErrorStatusByDateTime.create(IISLogErrorStatusByDateTime, function(err, todo) {
			if (err)
				res.send(err);

			res.json("200");
		});
	});
    
    /*******************************************************************************************************/
};
 