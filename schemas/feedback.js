var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var feedback = new Schema({
    comments: {type: String},
    rating: {type: Number},
    empId: {type: String},
    empName: {type: String}
}, {
    collection: constants.feedback
});

feedback.plugin(creationInfo);


module.exports = mongoose.model('feedback', feedback);







