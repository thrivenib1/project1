var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var GcmDispatch = new Schema({
    deviceId: {type: String},
    ctxData: {type: Schema.Types.Mixed},
    payload: {type: Schema.Types.Mixed}
}, {
    collection: constants.gcmdispatch
});

GcmDispatch.plugin(creationInfo);


module.exports = mongoose.model('GcmDispatch', GcmDispatch);







