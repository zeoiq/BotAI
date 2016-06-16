var mongoose = require('mongoose');
 
module.exports = mongoose.model('IISLogNoOfHitsAPIReport', {
    serverName : String,
	iisLogNoOfHitsAPI : {
                     iisLogNoOfHitsAPIDetails : [{ apiLink: String, noOfHits: String }]
                    },
    dateCreated : { type: Date, default: Date.now, index: true },
});

