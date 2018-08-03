var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var User = new Schema({
    username: {type: String},
    empCode: {type: Number},
    notificationCount: {type: Number, default: 0},
    psw: {type: String}
}, {
    collection: constants.user
});

User.plugin(creationInfo);


module.exports = mongoose.model('User', User);







