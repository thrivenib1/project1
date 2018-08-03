var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var email = new Schema({
    successMsg: {type: Schema.Types.Mixed},
    failureMsg:{type: Schema.Types.Mixed},
    empEmail: {type: String}
}, {
    collection: constants.email
});

email.plugin(creationInfo);


module.exports = mongoose.model('email', email);







