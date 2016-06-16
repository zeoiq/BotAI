var mongoose = require('mongoose');

module.exports = mongoose.model('IISLogErrorStatusReport', {
    serverName : String,
	iisLogErrorStatus : {
                     iisLogErrorStatusDetails : [{ status: String, total: String }]
                    },
    dateCreated : { type: Date, default: Date.now, index: true },
});