var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var Notification = new Schema({
    message: {type: Schema.Types.Mixed},
    system: {type: Boolean, default: false},
    img: {type: String},
    title: {type: String},
    from: {type: Number},
    to: {type: Number}

}, {
    collection: constants.notification
});

Notification.plugin(creationInfo);


module.exports = mongoose.model('Notification', Notification);







