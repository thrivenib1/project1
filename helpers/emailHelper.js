var emailConfig = require('../config/emailConfig');
var nodeutil = require('util');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var verboseLog = require('../services/loggerService').verbose;
var config = require('../config/config');
var sendmail = require('../config/emailConfig').transporter;
var emailModel = require('../schemas/email');
var async = require('async');


var emailHelper = function () {
};


/**
 *
 * @param templateObject   >> email template configured all email templates in emailConfig
 * @param empName          >> loggerIn user
 * @param startDate
 * @param endDate
 * @param approvedByName   >> reporting manager name
 * @param reqNumber        >> request number
 */

emailHelper.createEmailTemplate = function (templateObject, empName, startDate, endDate, approvedByName, reqNumber, reason) {
    var d = new Date();
    var month = d.getMonth() + 1;
    var reqDay = d.getFullYear() + '-' + month + '-' + d.getDate();

    if (templateObject.templateNumber === 0) {
        if (startDate == endDate) {
            return nodeutil.format(templateObject.templateForOneDay, empName.trim(), reason, startDate, approvedByName.trim(), reqNumber, empName.trim());
        } else {
            return nodeutil.format(templateObject.template, empName.trim(), reason, startDate, endDate, approvedByName.trim(), reqNumber, empName.trim());
        }

    } else if (templateObject.templateNumber === 3) {
        if (startDate == endDate) {
            return nodeutil.format(templateObject.templateForOneDay, empName.trim(), startDate, empName.trim(), reqDay, reqNumber);
        } else {
            return nodeutil.format(templateObject.template, empName.trim(), startDate, endDate, empName.trim(), reqDay, reqNumber);
        }

    } else if (templateObject.templateNumber === 1) {
        if (startDate == endDate) {
            return nodeutil.format(templateObject.templateForOneDay, startDate, empName.trim(), approvedByName.trim(), reqNumber);
        } else {
            return nodeutil.format(templateObject.template, startDate, endDate, empName.trim(), approvedByName.trim(), reqNumber);
        }
    } else if (templateObject.templateNumber === 2) {
        if (startDate == endDate) {
            return nodeutil.format(templateObject.templateForOneDay, startDate, empName.trim(), approvedByName.trim(), reqNumber);
        } else {
            return nodeutil.format(templateObject.template, startDate, endDate, empName.trim(), approvedByName.trim(), reqNumber);
        }
    } else {
        return nodeutil.format(templateObject.template, startDate, endDate, empName.trim(), approvedByName.trim(), reqNumber);
    }

};

/**
 *
 * @param clientIsAndroid  >> if android on click of approve/reject open the app else redirect to angular site
 * @param templateObject   >> used for email
 * @param empName          >> employee who is applying for leave
 * @param startDate        >> leave start date
 * @param endDate          >> leave end date
 * @param approvedByName   >> manager
 * @param reqNumber        >> leave request number
 * @param reason           >> reason for leave
 * @returns {boolean}
 */
emailHelper.createManagerEmailTemplate = function (clientIsAndroid, templateObject, empName, startDate, endDate, reqNumber, reason) {
    var url = "";
    if (templateObject.templateNumber === 0) {
        if (startDate == endDate) {
            return nodeutil.format(templateObject.managerTemplateForOneDayLeave, empName.trim(), reason, startDate, reqNumber, empName.trim());
        } else {
            return nodeutil.format(templateObject.managerTemplate, empName.trim(), reason, startDate, endDate, reqNumber, empName.trim());
        }
    } else {
        return true;
    }
};


emailHelper.sendMail = function (job, cb) {

    //we need to send individual email to manager,hr,employee only in case of request leave
    //so if the template number is 0 then its considered as request mail template
    //the email body will be changed for manager in case of request leave (the email body includes approve and reject buttons)
    //job.data.templateNumber === 0 for request leave
    verboseLog.verbose("=========== Track MAIL ===============");
    if (job.data.templateNumber === 0) {
        verboseLog.verbose("---- Sending Mail For Request Leave ----");
        emailHelper.sendMailForManager(job.data, function (err, r) {
            if (r) {
                async.series([
                    function (callback) {
                        emailHelper.sendMailForHr(job.data, function (err, r) {
                            return callback(null, "success");
                        });
                    }
                ], function (err, result) {
                    //track all the emails
                    logger.info("Email Info tracked for employee >> " + job.data.empEmail);
                    return cb(null, "success");
                });
            } else {
                return cb(null, "success");
            }
        });

    } else {
        verboseLog.verbose("---- Sending Mail For RSVP Leave  ----");
        emailHelper.sendRSVPEmail(job.data, function (err, r) {
            return cb(null, "success");
        });
    }
};


emailHelper.sendMailForHr = function (emailObj, cb) {
    verboseLog.verbose("Sending Hr Mail To >>" + emailConfig.defaultHrEmail, emailConfig.defaultFromMailId);
    var mailForEmpAndHr = {
        from: emailConfig.defaultFromMailId,
        to: emailConfig.defaultHrEmail,//"monicak@integramicro.co.in"
        cc: emailObj.empEmail,
        subject: emailObj.title,
        attachment: [
            {
                data: emailObj.taskData,
                alternative: true
            }
        ]
    };
    sendmail.send(mailForEmpAndHr, function (err, message) {
        if (err) {
            verboseLog.verbose("Error sendMailForHr>>" + JSON.stringify(err));
            verboseLog.verbose("Error sendMailForHr >>" + JSON.stringify(emailObj));
            return cb(null, "success");
        } else {
            verboseLog.verbose("Success sendMailForHr");
            return cb(null, "success");
        }
    });

};


emailHelper.sendMailForManager = function (emailObj, cb) {

    var emails = emailObj.instanceId.split(',');

    for (var i = 0; i < 3; i++) {
        if (i == 2) {
            return cb(null, "success");
        } else {
            var email = emails[i];
            console.log("sending manager email >>> " + email);
            verboseLog.verbose("sending manager email >>> " + email);

            var mailForManager = {
                from: emailConfig.defaultFromMailId,
                to: email,//emailObj.empEmail,
                subject: emailObj.title,
                attachment: [
                    {
                        data: emailObj.managerTemplate,
                        alternative: true
                    }
                ]
            };
            sendmail.send(mailForManager, function (err, message) {
                if (err) {
                    console.log("Error sendMailForManager>>" + JSON.stringify(err))
                    console.log("Error sendMailForManager >>" + JSON.stringify(email))
                    verboseLog.verbose("Error sendMailForManager>>" + JSON.stringify(err));
                    verboseLog.verbose("Error sendMailForManager >>" + JSON.stringify(email));
                } else {
                    console.log("Success sendMailForManager to >>" + email);
                    verboseLog.verbose("Success sendMailForManager to >>" + email);
                }
            });
        }
    }
};


emailHelper.sendRSVPEmail = function (emailObj, cb) {
    verboseLog.verbose("Sending RSVP Mail To >>" + emailConfig.defaultFromMailId, emailConfig.defaultHrEmail, emailObj.empEmail);
    var mailForEmpAndHr = {
        from: emailConfig.defaultFromMailId,
        to: emailConfig.defaultHrEmail,
        cc: emailObj.empEmail,
        subject: emailObj.title,
        attachment: [
            {
                data: emailObj.taskData,
                alternative: true
            }
        ]
    };
    sendmail.send(mailForEmpAndHr, function (err, message) {
        if (err) {
            verboseLog.verbose("Error sendRSVPEmail>>" + JSON.stringify(err));
            verboseLog.verbose("Error sendRSVPEmail >>" + JSON.stringify(emailObj));
            return cb(null, "success");
        } else {
            verboseLog.verbose("Success sendRSVPEmail");
            return cb(null, "success");
        }
    });
};

module.exports = emailHelper;