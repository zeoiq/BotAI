var mongoose = require('mongoose');

module.exports = mongoose.model('IISLogStatusReport', {
    serverName : String,
	iisLogStatus : {
                     iisLogStatusDetails : [{ apiLink: String, averageTimeTaken: String, maxTimeTaken: String, minTimeTaken: String }]
                    },
    dateCreated : { type: Date, default: Date.now, index: true },
});

