var mongoose = require('mongoose');

module.exports = mongoose.model('IISLogErrorStatusByDateTimeReport', {
    serverName : String,
	iisLogErrorStatusByDateTime : [{
                        timeStamp : Date,
                        iisLogErrorStatusByDateTimeDetails : [{ status: String, noOfHits: String }]
                    }],
    dateCreated : { type: Date, default: Date.now, index: true },
});

