var mongoose = require('mongoose');

module.exports = mongoose.model('IISLogNoOfHitsAPICIPReport', {
    serverName : String,
	iisLogNoOfHitsAPICIP : [{
                        apiLink : String,
                        iisLogNoOfHitsAPICIPDetails : [{ sourceIP: String, noOfHits: String }]
                    }],
    dateCreated : { type: Date, default: Date.now, index: true },
});

