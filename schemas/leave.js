var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var Leave = new Schema({
    empCode: {type: String},
    reqNum: {type: String},
    in_integra: {type: Boolean, default: true}
}, {
    collection: constants.leave
});

Leave.plugin(creationInfo);


module.exports = mongoose.model('Leave', Leave);