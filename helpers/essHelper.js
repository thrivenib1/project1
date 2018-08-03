var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var essQuery = require('../utils/essQueryConstants');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var logger = require('../services/loggerService').infoLog;
var async = require('async');
var errLog = require('../services/loggerService').errorLog;
var ratingDes = require('../utils/essConstants').rating;
var importantDes = require('../utils/essConstants').important;
var forEach = require('async-foreach').forEach;


var essHelper = function () {
};

/**
 * ref number is the unique key to all the survey tables(survey_ques/survey_com)
 * ref number can be found in the table - inc
 * after adding survey the ref number should be incremented for each transaction
 * @param cb
 */
essHelper.getSurveyRefNumber = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.GET_ESS_REFNUM, [], function (err, refNum) {
        if (err) {
            console.log("error >>>" + err);
            cb(err, false)
        } else {
            cb(null, refNum[0].inc)
        }
    })
};


essHelper.updateSurveyRefNumber = function (updateRefNum, cb) {
    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.UPDATE_ESS_REFNUM, [updateRefNum], function (err, refNum) {
        return err ? cb(err, false) : cb(null, true);
    })
};

essHelper.constructSurveyResponse = function (values, que, cb) {
    var list = [];
    forEach(values, function (val, index, arr) {
        val.ratingDes = ratingDes.arr[val.rating];
        val.importantDes = importantDes.arr[val.important];
        val.ques_desc = que[index].ques_desc;
        list.push(val);
        if (index == values.length - 1) {
            cb(null, list);
        }
    });
};


essHelper.insertLeastDummySurvey = function (questions, refNum, ratingList, importanceList, attitude, comments1, comments2, comments3, comments4, cb) {

    var surveyQueDummyRatingQuery = 'Insert into survey_ques_dummy (ref_no ,login,rate_imp,' + questions + ') values (' + ratingList + ')';

    pgSqlUtils.executeQuery(pgSqlService.essClient, surveyQueDummyRatingQuery, [], function (err, survey_com_dummy_rating) {
        if (err) {
            errLog.err("Error while inserting rating to table >> " + err);
            cb(err, null);
        } else {
            var surveyQueDummyImportanceQuery = 'Insert into survey_ques_dummy (ref_no ,login,rate_imp,' + questions + ') values (' + importanceList + ')';
            pgSqlUtils.executeQuery(pgSqlService.essClient, surveyQueDummyImportanceQuery, [], function (err, survey_com_dummy_important) {
                if (err) {
                    errLog.err("Error while inserting important to table >> " + err);
                    cb(err, null);
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.INSERT_ESS_SURVEY_COM_DUMMY, [refNum, attitude, comments1, comments2, comments3, comments4], function (err, survey_com_dummy) {
                        essHelper.updateSurveyRefNumber(refNum, function (err, refNumUpdated) {
                            cb(null, true);
                        })
                    })
                }
            })
        }
    })
};


essHelper.insertSurvey = function (questions,refNum, ratingList, importanceList, attitude, comments1, comments2, comments3, comments4, cb) {
    var surveyQueDummyRatingQuery = 'Insert into survey_ques (ref_no ,login,rate_imp,' + questions + ') values (' + ratingList + ')';
    pgSqlUtils.executeQuery(pgSqlService.essClient, surveyQueDummyRatingQuery, [], function (err, survey_com_dummy_rating) {
        if (err) {
            errLog.err("Error while inserting rating to table >> " + err);
            cb(err, null);
        } else {
            var surveyQueDummyImportanceQuery = 'Insert into survey_ques (ref_no ,login,rate_imp,' + questions + ') values (' + importanceList + ')';
            pgSqlUtils.executeQuery(pgSqlService.essClient, surveyQueDummyImportanceQuery, [], function (err, survey_com_dummy_important) {
                if (err) {
                    errLog.err("Error while inserting important to table >> " + err);
                    cb(err, null);
                } else {
                    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.INSERT_ESS_SURVEY_COM, [refNum, new Date(), attitude, comments1, comments2, comments3, comments4], function (err, survey_com_dummy) {
                        essHelper.updateSurveyRefNumber(refNum, function (err, refNumUpdated) {
                            cb(null, true);
                        })
                    })
                }
            })
        }
    })
};

essHelper.updatePoll = function (flag, refno, cb) {
    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.UPDATE_ESS_POLL_FLAG, [flag, refno], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.updatePoll");
            cb(null, result);
        }
    })
};


/**
 *
 * @param refNum
 * @param cb
 *
 * 1.Move the values from survey_com_dummy to survey_com
 * 2.Delete the record from survey_ques_dummy for the ref_no
 * 3.Delete the record from survey_com_dummy for the ref_no
 */
essHelper.moveSurveyComDummyToSurveyCom = function (refNum, cb) {
    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.SELECT_FROM_SURVEY_COM_DUMMY, [refNum], function (err, result1) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.essClient);
            cb(err, null);
        } else {
            pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.INSERT_ESS_SURVEY_COM, [refNum, new Date(), result1[0].attitude, result1[0].comments1, result1[0].comments2, result1[0].comments3, result1[0].comments4], function (err, survey_com) {
                essHelper.updateSurveyRefNumber(refNum, function (err, refNumUpdated) {
                    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.DELETE_ESS_SURVEY_COM_DUMMY, [refNum], function (err, result2) {
                        logger.info("final delete >> "+result2);
                        cb(null, true);
                    })
                })
            });
        }
    })
};


module.exports = essHelper;
