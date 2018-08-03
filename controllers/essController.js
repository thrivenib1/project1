var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var essQuery = require('../utils/essQueryConstants');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var errLog = require('../services/loggerService').errorLog;
var logger = require('../services/loggerService').infoLog;
var essHelper = require('../helpers/essHelper');
var forEach = require('async-foreach').forEach;
var essConstants = require('../utils/essConstants');
var async = require('async');
var _ = require('lodash');


var essController = function () {
};


/**
 * @param GET
 * @param req
 * @param res
 * - database name - ess
 * - getting questions from survey table
 * - getting rating from rating table
 * - getting importance from importance table
 */
essController.getEssQue = function (req, res) {
    pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.GET_ESS_QUESTIONS, [], function (err, results) {
        pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.GET_ESS_RATINGS, [], function (err, ratings) {
            pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.GET_ESS_IMPORTANCE, [], function (err, importance) {
                pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.GET_ESS_ATTITUDE, [], function (err, attitude) {
                    if (err) {
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                            Error: err,
                            Token: req.user[0].token
                        }));
                    } else {
                        if (results && results.length) {
                            var questions = [];
                            var itemsProcessed = 0;
                            async.forEach(results, function (result) {

                                result.ques_section = result.ques_code.substring(0, 1);
                                result.ques_num = result.ques_code.substring(1, result.ques_code.length);
                                result.ques_code = result.ques_code.trim();
                                questions.push(result);
                                itemsProcessed++;
                                if (itemsProcessed === results.length) {
                                    return res.json(flashMessage.success(Const.SUCCESS, {
                                        Questions: questions,
                                        Token: req.user[0].token,
                                        Rating: ratings,
                                        Importance: importance,
                                        Attitude: attitude
                                    }));
                                }
                            })
                        } else {
                            return res.json(flashMessage.success(Const.INFO_NO_RESULTS_FOUND, {Token: req.user[0].token}));
                        }
                    }
                })
            })
        })
    })
};

/**
 *
 * @param req - get survey
 * @param res
 *
 * ------------------- If one least value is found ----------------------
 * table - survey_com_dummy (store attitude,comments1,comments2,comments3,comments4)
 * table - survey_ques_dummy(2 records per survey 1) rating and 2) importance) has survey number for both
 * -------------------- return response ----------------------------------
 *
 *
 * table - survey_com (store attitude,comments1,comments2,comments3,comments4) - update survey date(current date)
 * table - survey_ques(2 records per survey 1) rating and 2) importance) has survey number for both
 *
 *
 * table - survey_rem
 *
 */
essController.submitSurvey = function (req, res) {
    var survey = req.body.survey;
    var login = req.user[0].login.trim();
    var attitude = req.body.attitude;
    var comments1 = req.body.comments1;
    var comments2 = req.body.comments2;
    var comments3 = req.body.comments3;
    var comments4 = req.body.comments4;


    logger.info("req.body = = = = ===========");
    logger.info(req.body);

    if (!survey || !attitude || !comments1 || !comments2 || !comments3 || !comments4) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
    }


    //get ref num from table inc
    essHelper.getSurveyRefNumber(function (err, refNum) {
        if (err) {
            errLog.err("Error in getting survey number(essController.submitSurvey) >> " + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                Error: err,
                Token: req.user[0].token
            }));
        } else {
            refNum = refNum + 1;
            var surveyObj = JSON.parse(survey);
            var leastVal = _.filter(surveyObj, {rating: 1});
            var ratingList = _.map(surveyObj, 'rating');
            var importanceList = _.map(surveyObj, 'important');
            var questionList = _.map(JSON.parse(survey), 'que_code');

            //pushing refnumber beginning of the array
            ratingList.unshift("'" + essConstants.ratingCode + "'");
            ratingList.unshift("'" + login + "'");
            ratingList.unshift(refNum);

            importanceList.unshift("'" + essConstants.importanceCode + "'");
            importanceList.unshift("'" + login + "'");
            importanceList.unshift(refNum);



            var list = questionList.toString().replace(/^\[([^]*)]$/, '$1');
            var res2 = list.split(",");
            var questions = res2.join(',');


            //if least value found - write to dummy database
            if (leastVal.length) {
                essHelper.insertLeastDummySurvey(questions, refNum, ratingList, importanceList, attitude, comments1, comments2, comments3, comments4, function (err, done) {
                    if (err) {
                        errLog.err("Error while insertLeastDummySurvey >> " + err);
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                            Error: err,
                            Token: req.user[0].token
                        }));
                    } else {
                        var questionsList = _.map(leastVal, 'que_code');
                        var list = questionsList.toString().replace(/^\[([^]*)]$/, '$1');
                        var res2 = list.split(",");
                        var data = "'" + res2.join("','") + "'";

                        var query = "select * from survey where ques_code in (" + data + ") order by ques_code";
                        pgSqlUtils.executeQuery(pgSqlService.essClient, query, [], function (err, que) {
                            essHelper.constructSurveyResponse(leastVal, que, function (err, response) {
                                return res.json(flashMessage.success(Const.SUCCESS, {
                                    Result: response,
                                    Token: req.user[0].token,
                                    refNum: refNum
                                }));
                            })
                        });
                    }
                });
            } else {
                essHelper.insertSurvey(questions, refNum, ratingList, importanceList, attitude, comments1, comments2, comments3, comments4, function (err, done) {
                    if (err) {
                        errLog.err("Error while insertSurvey >> " + err);
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                            Error: err,
                            Token: req.user[0].token
                        }));
                    } else {
                        return res.json(flashMessage.success(Const.SUCCESS, {
                            Token: req.user[0].token,
                            refNum: refNum
                        }));
                    }
                });
            }
        }
    })
};


essController.submitReason = function (req, res) {
    var reasons = req.body.reasons;
    var refNum = req.body.refNum;
    refNum = parseInt(refNum);

    logger.info("refNum on  submitReason>>"+refNum);

    if (!reasons || !refNum) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
    }

    var reasonObj = JSON.parse(reasons);

    //insert into survey_rem table
    //get all the rating and important from survey_ques_dummy and insert to survey_ques

    forEach(reasonObj, function (reason, index, arr) {
        var val = refNum + ",'" + reason.ques_no + "','" + reason.remarks1 + "'";
        var query = "Insert into survey_rem (ref_no,ques_no,remarks1) values (" + val + ")";
        pgSqlUtils.executeQuery(pgSqlService.essClient, query, [], function (err, que) {
            return;
        })
    }, function (e, r) {
        pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.SELECT_ESS_SURVEY_QUE_DUMMY_RATING, [refNum, 'R'], function (err, dummy_rating) {
            if (err) {
                errLog.err("Error while insertSurvey >> " + err);
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                    Error: err,
                    Token: req.user[0].token
                }));
            } else {
                pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.SELECT_ESS_SURVEY_QUE_DUMMY_IMPORTANT, [refNum, 'I'], function (err, dummy_imp) {
                    //var rating = Object.values(dummy_rating[0]);
                    var rating = _.values(dummy_rating[0]);
                    if (err) {
                        errLog.err("Error while SELECT_ESS_SURVEY_QUE_DUMMY_IMPORTANT >> " + err);
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                            Error: err,
                            Token: req.user[0].token
                        }));
                    } else {
                        pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.INSERT_ESS_SURVEY_QUE_RATING, rating, function (err, que) {
                            var imp = _.values(dummy_imp[0]);
                            if (err) {
                                errLog.err("Error while INSERT_ESS_SURVEY_QUE_RATING >> " + err);
                                return res.json("Duplicate key value violates unique constraint", {
                                    Error: err,
                                    Token: req.user[0].token
                                });
                            } else {
                                pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.INSERT_ESS_SURVEY_QUE_IMPORTANT, imp, function (err, que) {
                                    if (err) {
                                        errLog.err("Error while INSERT_ESS_SURVEY_QUE_IMPORTANT >> " + err);
                                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                            Error: err,
                                            Token: req.user[0].token
                                        }));
                                    } else {
                                        //delete for surevey_que_dummy table (r/i)
                                        pgSqlUtils.executeQuery(pgSqlService.essClient, essQuery.DELETE_ESS_SURVEY_QUES_DUMMY, [refNum], function (err, que) {
                                            if (err) {
                                                errLog.err("Error while  DELETE_ESS_SURVEY_QUES_DUMMY>> " + err);
                                                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {
                                                    Error: err,
                                                    Token: req.user[0].token
                                                }));
                                            } else {
                                                //move from survey_comm_dummy to survey_com
                                                essHelper.moveSurveyComDummyToSurveyCom(refNum,function(e,r){
                                                    return res.json(flashMessage.success(Const.SUCCESS, {
                                                        Token: req.user[0].token,
                                                        refNum: refNum
                                                    }));
                                                })

                                            }
                                        });

                                        // - select from survey_comm_dummy and insert to survey_com

                                        //move from survey_comm_dummy to survey_com
                                        //delete for survey_comm_dummy table (r/i)


                                        //return res.json(flashMessage.success(Const.SUCCESS, {
                                        //    Token: req.user[0].token,
                                        //    refNum: refNum
                                        //}));
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })
};



essController.updatePollFlag = function (req, res) {

    var refNo = req.params.refno;
    var flag = req.params.poll;

    if (!refNo || !flag) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    essHelper.updatePoll(flag, refNo, function (err, result) {
        if (err) {
            errLog.err("error in mrbsController.updatePoll" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in mrbsController.updatePoll");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};


module.exports = essController;
