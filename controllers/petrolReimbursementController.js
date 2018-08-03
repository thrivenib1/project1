var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var Query = require('../utils/queryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var medicalReimbursementController = require('../controllers/petrolReimbursementController');
var petrolReimbursementModel = require('../schemas/petrolReimbursement');
var utils = require('../utils/utils');
var async = require('async');

var petrolReimbursement = function () {
};

//add petrolReimbursement
petrolReimbursement.addPetrolReimbursement = function (req, res) {
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var amount = req.body.amount;
    var user = req.user[0];
    var empCode = user.emp_code;


    if (!billDate || !billNumber || !amount) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    var petrolReimbursement = new petrolReimbursementModel();
    petrolReimbursement.empCode = empCode;
    petrolReimbursement.billDate = billDate;
    petrolReimbursement.billNumber = billNumber;
    petrolReimbursement.amount = amount;
    petrolReimbursement.save(function (err, result) {
        if (err) {
            errLog.err("error in addPetrolReimbursement");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in addPetrolReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};
petrolReimbursement.getReferenceNumber = function () { //todo - create table for getting reimbursement reference number
    return Math.floor(Math.random() * 20000 * new Date().getUTCMilliseconds());
};

petrolReimbursement.addReferenceToPetrolReimbursement = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    var referenceNumber = petrolReimbursement.getReferenceNumber();

    //update reference number to all the medical reimbursement
    petrolReimbursementModel.update({
            $and: [
                {empCode: empCode, refNumber: {$exists: false}}]
        }
        , {$set: {refNumber: referenceNumber}}, {multi: true}, function (err, results) {
            if (err) {
                errLog.err("error in addReferenceToPetrolReimbursement");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in addReferenceToPetrolReimbursement");
                petrolReimbursement.getAllPetrolReference(empCode, function (err, results) {
                    return res.json(flashMessage.success(Const.SUCCESS, {
                        Result: results,
                        Token: req.user[0].token
                    }));
                });
            }
        })
};


petrolReimbursement.getAllPetrolReference = function (empCode, cb) {
    petrolReimbursementModel.find({empCode: empCode}, {_id: 0, refNumber: 1}, function (err, results) {
        if (err) {
            cb(err, null);
        } else {
            if (results && results.length) {
                utils.getAllRefNumber(results, function (err, dupRefNumber) {
                    if (err) {
                        cb(err, null);
                    } else {
                        utils.dedupe(dupRefNumber, function (err, results) {
                            if (err) {
                                cb(err, null);
                            } else {
                                petrolReimbursement.getOnePetrolListByRefNumber(results, function (err, results) {
                                    cb(null, results);
                                })
                            }
                        })
                    }
                });
            } else {
                cb("no results found", null);
            }

        }
    })
};

petrolReimbursement.getOnePetrolListByRefNumber = function (listOfRefNumb, cb) {
    var arr = [];
    var itemsProcessed = 0;
    if (listOfRefNumb && listOfRefNumb.length) {
        async.forEach(listOfRefNumb, function (refNumber) {
            if (refNumber && refNumber != "undefined") {
                petrolReimbursementModel.findOne({refNumber: refNumber}, function (err, result) {
                    arr.push(result);
                    itemsProcessed++;
                    if (itemsProcessed === listOfRefNumb.length) {
                        cb(null, arr);
                    }
                });
            } else {
                petrolReimbursementModel.remove({refNumber: refNumber}, function (err, result) {
                    itemsProcessed++;
                    if (itemsProcessed === listOfRefNumb.length) {
                        cb(null, arr);
                    }
                })
            }

        });
    } else {
        cb("Error Nor Found");
    }
};

petrolReimbursement.getPetrolListByEmpId = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;

    petrolReimbursementModel.findOne({empCode: empCode}, function (err, results) {
        if (err) {
            errLog.err("error in getPetrolListByEmpId");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getPetrolListByEmpId");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


petrolReimbursement.editPetrolReimbursement = function (req, res) {

    var medicalDocId = req.body.id;
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var amount = req.body.amount;

    if (!billDate || !billNumber || !amount || !medicalDocId) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    petrolReimbursementModel.update({_id: medicalDocId}, {
        $set: {
            billDate: billDate,
            billNumber: billNumber,
            amount: amount
        }
    }, function (err, results) {
        if (err) {
            errLog.err("error in editPetrolReimbursement");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in editPetrolReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


petrolReimbursement.getPetrolListByReferenceNum = function (req, res) {

    var refNumber = req.params.refNumber;
    var user = req.user[0];
    var empCode = user.emp_code;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    petrolReimbursementModel.find({$and: [{refNumber: refNumber, empCode: empCode}]}, function (err, results) {
        if (err) {
            errLog.err("error in getPetrolListByReferenceNum");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getPetrolListByReferenceNum");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


petrolReimbursement.getPetrolListByReferenceNumHR = function (req, res) {

    var refNumber = req.params.refNumber;
    var user = req.user[0];
    var empCode = user.emp_code;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    petrolReimbursementModel.find({$and: [{refNumber: refNumber}]}, function (err, results) {
        if (err) {
            errLog.err("error in getPetrolListByReferenceNum");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in getPetrolListByReferenceNum");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};

petrolReimbursement.deletePetrolReimbursement = function (req, res) {

    var refNumber = req.params.refNumber;
    var user = req.user[0];
    var empCode = user.emp_code;
    var petrolDocId = req.params.id;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    petrolReimbursementModel.remove({
        $and: [{
            _id: petrolDocId,
            refNumber: refNumber,
            empCode: empCode
        }]
    }, function (err, results) {
        if (err) {
            errLog.err("error in deletePetrolReimbursement");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in deletePetrolReimbursement");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};


petrolReimbursement.getUniquePetrolList = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    petrolReimbursement.getAllPetrolReference(empCode, function (err, results) {
        if (results && results.length) {
            logger.info("success in getUniquePetrolList");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        } else {
            errLog.err("error in getUniquePetrolList");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        }
    })
};

petrolReimbursement.approvePetrolReimbursement = function (req, res) {
    var refNumber = req.body.refNumber;
    if (!refNumber) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    petrolReimbursementModel.update({refNumber: refNumber},
        {$set: {verified: true}}, {multi: true}
        , function (err, results) {
            if (err) {
                errLog.err("err in getUniquePetrolList");
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
            } else {
                logger.info("success in getUniquePetrolList");
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: results,
                    Token: req.user[0].token
                }));
            }
        })
};

//addPetrolReimbursement for existing list
petrolReimbursement.addPetrolReimbForExistingModel = function (req, res) {
    var user = req.user[0];
    var empCode = user.emp_code;
    var refNumber = req.body.refNumber;
    var billDate = req.body.billDate;
    var billNumber = req.body.billNumber;
    var billAmount = req.body.billAmount;

    if (!refNumber || !billDate || !billNumber || !billAmount) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    var petrolReimbursement = new petrolReimbursementModel();
    petrolReimbursement.empCode = empCode;
    petrolReimbursement.billDate = billDate;
    petrolReimbursement.billNumber = billNumber;
    petrolReimbursement.amount = billAmount;
    petrolReimbursement.refNumber = refNumber;
    petrolReimbursement.save(function (err, result) {
        if (err) {
            errLog.err("error in addPetrolReimbForExistingModel");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in addPetrolReimbForExistingModel");
            return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};


petrolReimbursement.getAllPetrolBill = function (req, res) {
    petrolReimbursementModel.find({}, function (err, results) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: results,
                Token: req.user[0].token
            }));
        }
    })
};
petrolReimbursement.getAllMedicalBill = function (req, res) {
    petrolReimbursementModel.find({}, {_id: 0, refNumber: 1}, function (err, results) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            if (results && results.length) {
                utils.getAllRefNumber(results, function (err, dupRefNumber) {
                    utils.dedupe(dupRefNumber, function (err, results) {
                        petrolReimbursement.getOnePetrolListByRefNumber(results, function (err, results) {
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

module.exports = petrolReimbursement;