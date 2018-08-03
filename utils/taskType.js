var TASK = function () {
};

TASK.emailService = 0; // 0
TASK.gcmPushService = TASK.emailService + 1; // 1
TASK.postLeaveRequest = TASK.gcmPushService + 1;//2
TASK.postLeaveRequestApprove = TASK.postLeaveRequest + 1;//2
TASK.postLeaveRequestReject = TASK.postLeaveRequestApprove + 1;//2
TASK.postLeaveRequestCancel = TASK.postLeaveRequestReject + 1;//2


module.exports.TASK = TASK;