var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var admin = new Schema({
    adminId: {type: Schema.Types.ObjectId},
    empCode: {type: String},
    allowReimbursement: {type: Boolean, default: false}
}, {
    collection: constants.admin
});

admin.plugin(creationInfo);


module.exports = mongoose.model('admin', admin);







