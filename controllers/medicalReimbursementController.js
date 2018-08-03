var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var utils = require('../utils/utils');
var medicalReimbursementModel = require('../schemas/medicalReimbursement');
var async = require('async');

var medicalReimbursementController = function () {
};

medicalReimbursementController.getReferenceNumber = function () { //todo - create table for getting reimbursement reference number
    return Math.floor(Math.random() * 20000 * new Date().getUTCMilliseconds());
};

medicalReimbursementController.addMedicalReimbursement = function (req, res) {
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var amount = req.body.amount;
    var user = req.user[0];
    var empCode = user.emp_code;


    if (!billDate || !billNumber || !amount) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    var medicalReimbursement = new medicalReimbursementModel();
    medicalReimbursement.empCode = empCode;
    medicalReimbursement.billDate = billDate;
    medicalReimbursement.billNumber = billNumber;
    medicalReimbursement.amount = amount;
    medicalReimbursement.save(function (err, result) {
        if (err) {
            errLog.err("error in addMedicalReimbursement" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in addMedicalReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};


medicalReimbursementController.addReferenceToMedicalReimbursement = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    var referenceNumber = medicalReimbursementController.getReferenceNumber();

    //update reference number to all the medical reimbursement
    medicalReimbursementModel.update({
            $and: [
                {empCode: empCode, refNumber: {$exists: false}}]
        }
        , {$set: {refNumber: referenceNumber}}, {multi: true}, function (err, results) {
            if (err) {
                errLog.err("error in addReferenceToMedicalReimbursement" + err);
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                medicalReimbursementController.getAllMedicalReference(empCode, function (err, results) {
                    logger.info("success in addReferenceToMedicalReimbursement");
                    return res.json(flashMessage.success(Const.SUCCESS, {
                        Result: results,
                        Token: req.user[0].token
                    }));
                });
            }
        })
};


medicalReimbursementController.getMedicalListByEmpId = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;

    medicalReimbursementModel.findOne({empCode: empCode}, function (err, results) {
        if (err) {
            errLog.err("error in getMedicalListByEmpId" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getMedicalListByEmpId");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};

medicalReimbursementController.editMedicalReimbursement = function (req, res) {

    var medicalDocId = req.body.id;
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var amount = req.body.amount;

    if (!billDate || !billNumber || !amount || !medicalDocId) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    medicalReimbursementModel.update({_id: medicalDocId}, {
        $set: {
            billDate: billDate,
            billNumber: billNumber,
            amount: amount
        }
    }, function (err, results) {
        if (err) {
            errLog.err("Error in editMedicalReimbursement" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in editMedicalReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};

medicalReimbursementController.getMedicalListByReferenceNum = function (req, res) {

    var refNumber = req.params.refNumber;
    var user = req.user[0];
    var empCode = user.emp_code;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    medicalReimbursementModel.find({$and: [{refNumber: refNumber, empCode: empCode}]}, function (err, results) {
        if (err) {
            errLog.err("error in getMedicalListByReferenceNum");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getMedicalListByReferenceNum");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};

medicalReimbursementController.deleteMedicalReimbursement = function (req, res) {

    var refNumber = req.params.refNumber;
    var medicalDocId = req.params.id;
    var user = req.user[0];
    var empCode = user.emp_code;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    medicalReimbursementModel.remove({
        $and: [{
            _id: medicalDocId,
            refNumber: refNumber,
            empCode: empCode
        }]
    }, function (err, results) {
        if (err) {
            errLog.err("error in deleteMedicalReimbursement");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in deleteMedicalReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


medicalReimbursementController.getUniqueMedicalList = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    medicalReimbursementController.getAllMedicalReference(empCode, function (err, results) {
        return res.json(flashMessage.success(Const.SUCCESS, {
            Result: results,
            Token: req.user[0].token
        }));
    })
};


medicalReimbursementController.getAllMedicalReference = function (empCode, cb) {
    medicalReimbursementModel.find({empCode: empCode}, {_id: 0, refNumber: 1}, function (err, results) {
        if (err) {
            cb(err, null);
        } else {
            if (results && results.length) {
                utils.getAllRefNumber(results, function (err, dupRefNumber) {
                    utils.dedupe(dupRefNumber, function (err, results) {
                        medicalReimbursementController.getOneMedicalListByRefNumber(results, function (err, results) {
                            cb(null, results);
                        })
                    });
                });
            } else {
                cb(err, null);
            }
        }
    })
};


medicalReimbursementController.getOneMedicalListByRefNumber = function (listOfRefNumb, cb) {
    var arr = [];
    var itemsProcessed = 0;
    if (listOfRefNumb && listOfRefNumb.length) {
        async.forEach(listOfRefNumb, function (refNumber) {
            if (refNumber && refNumber != "undefined") {
                medicalReimbursementModel.findOne({refNumber: refNumber}, function (err, result) {
                    arr.push(result);
                    itemsProcessed++;
                    if (itemsProcessed === listOfRefNumb.length) {
                        cb(null, arr);
                    }
                });
            } else {
                medicalReimbursementModel.remove({refNumber: refNumber}, function (err, result) {
                    itemsProcessed++;
                    if (itemsProcessed === listOfRefNumb.length) {
                        cb(null, arr);
                    }
                })
            }
        });
    } else {
        cb('Error Not Found', null);
    }
};


medicalReimbursementController.approveMedicalReimbursement = function (req, res) {

    var refNumber = req.body.refNumber;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    medicalReimbursementModel.update({refNumber: refNumber},
        {$set: {verified: true}}, {multi: true}
        , function (err, results) {
            if (err) {
                errLog.err("error in  approveMedicalReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in approveMedicalReimbursement");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
};


//addMedicalReimbursement for existing list
medicalReimbursementController.addMedicalReimbForExistingModel = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    var refNumber = req.body.refNumber;
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var billAmount = req.body.billAmount;

    if (!refNumber || !billDate || !billNumber || !billAmount) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    var medicalReimbursement = new medicalReimbursementModel();
    medicalReimbursement.empCode = empCode;
    medicalReimbursement.billDate = billDate;
    medicalReimbursement.billNumber = billNumber;
    medicalReimbursement.amount = billAmount;
    medicalReimbursement.refNumber = refNumber;
    medicalReimbursement.save(function (err, result) {
        if (err) {
            errLog.err("error in addMedicalReimbForExistingModel");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success  in addMedicalReimbForExistingModel");
            return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};


medicalReimbursementController.getAllMedicalRBYRefOrEmpcode = function (req, res) {
    var refNumber = req.body.refNumber;
    var empCode = req.body.empcode;
    var query;

    if (!refNumber && !empCode) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    if (refNumber) {
        query = {refNumber: refNumber}
    }

    if (empCode) {
        query = {empCode: empCode}
    }

    medicalReimbursementModel.find(query, function (err, results) {
        if (err) {
            errLog.err("error in getAllMedicalRBYRefOrEmpcode");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getAllMedicalRBYRefOrEmpcode");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })

};

medicalReimbursementController.getAllMedicalBill = function (req, res) {
    medicalReimbursementModel.find({}, {_id: 0, refNumber: 1}, function (err, results) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            if (results && results.length) {
                utils.getAllRefNumber(results, function (err, dupRefNumber) {
                    utils.dedupe(dupRefNumber, function (err, results) {
                        medicalReimbursementController.getOneMedicalListByRefNumber(results, function (err, results) {
                            return res.json(flashMessage.success(Const.SUCCESS, {
                                Result: results,
                                Token: req.user[0].token
                            }));
                        })
                    });
                });
            } else {
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            }
        }
    })
};


medicalReimbursementController.getMedicalListByReferenceNumHR = function (req, res) {

    var refNumber = req.params.refNumber;
    var user = req.user[0];
    var empCode = user.emp_code;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    medicalReimbursementModel.find({$and: [{refNumber: refNumber}]}, function (err, results) {
        if (err) {
            console.log("-------------------------------------");
            console.log(err);
            errLog.err("error in getMedicalListByReferenceNum");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getMedicalListByReferenceNum");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


module.exports = medicalReimbursementController;
