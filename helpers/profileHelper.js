var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var Query = require('../utils/queryConstants');
var async = require('async');
var _ = require('underscore');


var profileHelper = function () {
};


/**
 * Getting DOB of all employees
 * @param cb
 */
profileHelper.getEmpProfileDetails = function (emp_code, cb) {

    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    day = day.toString().length == 1 ? '0' + day : day;
    month = month.toString().length == 1 ? '0' + month : month;


    var dm = 21 + "-" + 4;
   // var dm = day + "-" + month;
    var itemsProcessed = 0;
    var arr = [];


    //getting emp profile details
    pgSqlUtils.executeQuery(pgSqlService.offproTestClient, Query.GET_EMP_PROFILE_DETAILS, [emp_code], function (err, empDet) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.offproTestClient);
            cb(err, null);
        } else {
            logger.info("Success fetch emp profile details");
            //getting DOB details
            pgSqlUtils.executeQuery(pgSqlService.offproTestClient, Query.GET_EMP_DOB, [dm], function (err, result) {
                if (err) {
                    errLog.err("Error while connecting to " + pgSqlService.offproTestClient);
                    cb(err, null);
                } else {
                    logger.info("Success fetch emp DOB");
                    if (result.length) {
                        async.forEachSeries(result, function (res, callback) {
                            pgSqlUtils.executeQuery(pgSqlService.offproTestClient, Query.GET_EMP_CODE_BY_EMP_ID, [res.emp_code], function (err, bthday) {
                                var data = _.find(result, function (a) {
                                    return a.emp_code == res.emp_code;
                                });
                                data.designation = bthday[0].designation.trim();
                                data.fullName = bthday[0].emp_name.trim();
                                arr.push(data);
                                itemsProcessed++;
                                callback();
                                if (itemsProcessed === result.length) {
                                    cb(null, {dob: arr, profile: empDet});
                                }
                            });
                        });
                    } else {
                        cb(null, {dob: arr, profile: empDet});
                    }
                }
            })
        }
    });
};


profileHelper.getManagerProfileDetails = function (empcode, cb) {
    pgSqlUtils.executeQuery(pgSqlService.offproTestClient, Query.GET_EMP_PROFILE_DETAILS, [empcode], function (err, empDet) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, empDet);
        }
    })
};


module.exports = profileHelper;



