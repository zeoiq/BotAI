var mongoose = require('mongoose');

module.exports = mongoose.model('TwitterLink', {
	twitterName : String,
	tweetsLink : String,
    tweetsRepliesLink : String
});