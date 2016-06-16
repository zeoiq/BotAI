var mongoose = require('mongoose');

module.exports = mongoose.model('IISLogErrorStatusByAPIReport', {
    serverName : String,
	iisLogErrorStatusByAPI : [{
                        errorCode : String,
                        iisLogErrorStatusByAPIDetails : [{ apiLink: String, noOfHits: String }]
                    }],
    dateCreated : { type: Date, default: Date.now, index: true },
});

