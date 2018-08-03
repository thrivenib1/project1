var nodegcm = require('node-gcm');
var gcmConfig = require('../config/gcmConfig');
var logger = require('../services/loggerService').infoLog;
var traceLog = require('../services/loggerService').traceLog;
var verboseLog = require('../services/loggerService').verbose;
var adminModel = require('../schemas/admin');
var constants = require('../utils/constants');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var Query = require('../utils/queryConstants');
var errLog = require('../services/loggerService').errorLog;
var mongoose = require('mongoose');

var adminController = function () {
};

/**
 * Once the HR opens slot for applying
 * only in allowed period the employee can apply for petrol/medical reimbursement
 */
adminController.allowReimbursement = function (req, res) {
    var empCode = req.user[0].emp_code_entered;
    var id = mongoose.Types.ObjectId(constants.adminId);
    adminModel.update({adminId: id},
        {$set: {allowReimbursement: true, empCode: empCode}}
        , function (err, results) {
            if (err) {
                errLog.err("error in  allowReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in allowReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
};


adminController.blockReimbursement = function (req, res) {
    var empCode = req.user[0].emp_code_entered;
    var id = mongoose.Types.ObjectId(constants.adminId);
    adminModel.update({adminId: id},
        {$set: {allowReimbursement: false, empCode: empCode}}
        , function (err, results) {
            if (err) {
                errLog.err("error in  blockReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in blockReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
};

/**
 * this will be initialized as soon as the server starts
 */
adminController.createAdminDoc = function () {
    var id = mongoose.Types.ObjectId(constants.adminId);
    adminModel.findOne({adminId: id}, function (err, docs) {
        if (!docs) {
            var adminDoc = new adminModel();
            adminDoc.adminId = id;
            adminDoc.save();
        }
    });
};

/**
 *
 * @param grade >> if the grade is >= 50 then allow and slot should be open to apply
 * @param cb
 */
adminController.ifReimSlotOpen = function (cb) {
    var id = mongoose.Types.ObjectId(constants.adminId);
    var slotOpen;
    adminModel.findOne({adminId: id}, function (err, doc) {
        if (doc) {
            slotOpen = doc.allowReimbursement == true ? true : false;
            cb(null, slotOpen);
        } else {
            cb(null, false);
        }
    })
};


adminController.ifUserEligibleForPetrolReim = function (grade, cb) {
    var userEliglible;
    adminController.ifReimSlotOpen(function (err, slotOpened) {
        if (slotOpened) {
            userEliglible = grade >= 50 ? true : false;
            cb(null, userEliglible);
        } else {
            cb(null, false);
        }
    })
};


module.exports = adminController;