var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var medicalReimbursement = new Schema({
    empCode: {type: String},
    billDate: {type: String},
    billNumber: {type: String},
    amount: {type: String},
    refNumber: {type: String},
    verified: {type: Boolean, default: false}
}, {
    collection: constants.medical_reimbursement
});

medicalReimbursement.plugin(creationInfo);


module.exports = mongoose.model('medicalReimbursement', medicalReimbursement);







