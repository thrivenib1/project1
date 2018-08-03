var gcmMessageStrings = function () {
};

var gcmMsgString = [];

var gcmConst = function () {
};

gcmConst['string'] = '';


gcmConst.REQUEST_LEAVE_FOR_ONE_DAY = 0;//1
gcmConst.REQUEST_LEAVE_FOR_MULTIPLE_DAYS = gcmConst.REQUEST_LEAVE_FOR_ONE_DAY + 1;//2
gcmConst.CANCELED_LEAVE = gcmConst.REQUEST_LEAVE_FOR_MULTIPLE_DAYS + 1;//3
gcmConst.REJECT_LEAVE = gcmConst.CANCELED_LEAVE + 1;//3
gcmConst.APPROVE_LEAVE = gcmConst.REJECT_LEAVE + 1;//3



gcmMsgString[gcmConst.APPROVE_LEAVE] = "Your leave is been Approved by %s";
gcmMsgString[gcmConst.REJECT_LEAVE] = "Your leave is rejected by %s";
gcmMsgString[gcmConst.CANCELED_LEAVE] = "%s Canceled Leave";
gcmMsgString[gcmConst.REQUEST_LEAVE_FOR_MULTIPLE_DAYS] = "%s Is Requesting For Leave from %s to %s";
gcmMsgString[gcmConst.REQUEST_LEAVE_FOR_ONE_DAY] = "%s Is Requesting For Leave On %s";

module.exports.gcmConst = gcmConst;
module.exports.gcmMsgString = gcmMsgString;