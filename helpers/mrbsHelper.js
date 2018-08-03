var logger = require('../services/loggerService').infoLog;
var leaveHelper = require('../helpers/leaveHelper');
var mrbsHelper = function () {};


/*************************************************************
 * @param sTime - its new Date().getTime() * 1000 - epoch time
 * @param eTime - its new Date().getTime() * 1000 - epoch time
 * @param cb
 *************************************************************/
mrbsHelper.checkIfWeekend = function (sTime, eTime, cb) {

    var s = new Date(sTime * 1000); // multiply by 1000 for milliseconds
    var sDate = s.toLocaleString('en-GB');//eDate returns array of [0] - date [1] - time
    sDate = sDate.split(',')[0];

    var e = new Date(eTime * 1000); // multiply by 1000 for milliseconds
    var eDate = e.toLocaleString('en-GB');//eDate returns array of [0] - date [1] - time
    eDate = eDate.split(',')[0];

    var startDate = new Date(sDate);
    var endDate = new Date(eDate);

    logger.info("startDate >> " + startDate);
    logger.info("endDate   >> " + endDate);

    logger.info("startDate day >> " + startDate.getDay());
    logger.info("endDate day   >> " + endDate.getDay());

    //leaveHelper.fetchHolidayList()

    if (startDate.getDay() === 0 || startDate.getDay() === 6 || endDate.getDay() === 0 || endDate.getDay() === 6) {
        logger.info('weekend');
        cb(null, true);
    } else {
        logger.info('weekday');
        cb(null, false);
    }
};


module.exports = mrbsHelper;
