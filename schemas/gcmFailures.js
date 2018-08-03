var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var GcmFailures = new Schema({
    deviceId: {type: String},
    errMsg: {type: Schema.Types.Mixed},
    payload: {type: Schema.Types.Mixed}
}, {
    collection: constants.gcmfailures
});

GcmFailures.plugin(creationInfo);


module.exports = mongoose.model('GcmFailures', GcmFailures);



