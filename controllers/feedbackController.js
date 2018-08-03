var feedbackModel = require('../schemas/feedback');
var errLog = require('../services/loggerService').errorLog;
var logger = require('../services/loggerService').infoLog;
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var feedbackCtr = function () {
};


feedbackCtr.addFeedback = function (req, res) {

    var comments = req.body.comments;
    var rating = req.body.rating;
    var empId = req.user[0].emp_code_entered.trim();
    var userName = req.user[0].emp_name.trim();

    if (!comments || !rating) {
        errLog.err("Missing required arguments while sending feedback");
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    feedbackModel.findOne({empId: empId}, function (err, foundExistingFeedback) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            if (foundExistingFeedback) {
                logger.info("found existing feedback");
                feedbackModel.update({empId: empId}, {
                    $set: {
                        comments: comments,
                        rating: rating
                    }
                }, function (err, feedbackUpdated) {
                    if (err) {
                        errLog.err("Error while updating feedback " + JSON.stringify(err));
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                    } else {
                        return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                            Result: feedbackUpdated,
                            Token: req.user[0].token
                        }));
                    }
                })
            } else {
                var feedbackDoc = new feedbackModel();
                feedbackDoc.comments = comments;
                feedbackDoc.rating = rating;
                feedbackDoc.empId = empId;
                feedbackDoc.empName = userName;
                feedbackDoc.save(function (err, result) {
                    if (err) {
                        errLog.err("feedbackCtr.addFeedback :: failure ");
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                    } else {
                        logger.info("feedbackCtr.addFeedback :: success ");
                        return res.json(flashMessage.success(Const.SUCCESS_ADDED_SUCCESSFULLY, {
                            Result: result,
                            Token: req.user[0].token
                        }));
                    }
                })
            }
        }
    });
};


feedbackCtr.getAllFeedback = function (req, res) {
    feedbackModel.find({}, function (err, feedbacks) {
        if (err) {
            errLog.err("error in getting feedback");
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("getAllFeedback success");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: feedbacks,
                Token: req.user[0].token
            }));
        }
    })
};


module.exports = feedbackCtr;