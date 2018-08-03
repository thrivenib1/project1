var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var creationInfo = require('../plugin/dateplugin');
var constants = require('../utils/constants');

var petrolReimbursement = new Schema({
    empCode: {type: String},
    billDate: {type: String},
    billNumber: {type: String},
    amount: {type: String},
    refNumber: {type: String},
    verified: {type: Boolean, default: false}
}, {
    collection: constants.petrol_reimbursement
});

petrolReimbursement.plugin(creationInfo);


module.exports = mongoose.model('petrolReimbursement', petrolReimbursement);







