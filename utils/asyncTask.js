var logger = require('../services/loggerService').infoLog;
var TASK = require('../utils/taskType').TASK;
var emailHelper = require('../helpers/emailHelper');
var kueConfig = require('../config/kueConfig');
var gcmHelper = require('../helpers/gcmHelper');
var leaveCtr = require('../controllers/leaveController');
var reportingHeadCtr = require('../controllers/reportingHeadController');

var asynctask = function () {
};

asynctask.TASKARRAY = [];

asynctask.r = function (f, n) {
    return {f: f, n: n};
};

asynctask.init = function () {
    asynctask.TASKARRAY[TASK.emailService] = asynctask.r(emailHelper.sendMail, 'emailHelper.sendMail');
    asynctask.TASKARRAY[TASK.gcmPushService] = asynctask.r(gcmHelper.sendGcmPush, 'gcmHelper.sendGcmPush');
    asynctask.TASKARRAY[TASK.postLeaveRequest] = asynctask.r(leaveCtr.postLeaveRequest, 'leaveCtr.postLeaveRequest');
    asynctask.TASKARRAY[TASK.postLeaveRequestApprove] = asynctask.r(reportingHeadCtr.postLeaveRequestApprove, 'reportingHeadCtr.postLeaveRequestApprove');
    asynctask.TASKARRAY[TASK.postLeaveRequestReject] = asynctask.r(reportingHeadCtr.postLeaveRequestReject, 'reportingHeadCtr.postLeaveRequestReject');
    asynctask.TASKARRAY[TASK.postLeaveRequestCancel] = asynctask.r(leaveCtr.postLeaveRequestCancel, 'leaveCtr.postLeaveRequestCancel');
};
// Task Dispatcher
asynctask.dispatch = function (job, done) {
    //logger.trace(job);
    logger.info("job.data.type >>> "+job.data.type);
    if (asynctask.TASKARRAY[job.data.type] === undefined) {
        return done('err in task dispatch');
    } else {
        var funct = asynctask.TASKARRAY[job.data.type];
        logger.info("Async function called - " + funct.n);
        funct.f(job, function (err, taskdata) {
            if (err) {
                return done(err);
            }
            return done(null, {status: 'Successfully executed the task.', taskdata: taskdata});
        });
    }
};

module.exports.asynctask = asynctask;