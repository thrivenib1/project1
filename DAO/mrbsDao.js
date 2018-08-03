var pgSqlUtils = require('../utils/pgSqlUtils');
var pgSqlService = require('../services/pgSqlService');
var Query = require('../utils/mrbsQueryConstants');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;

var mrbsDao = function () {
};

mrbsDao.getMrbsEntryId = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.mrbsClient, Query.GET_MRBS_ENTRY_ID, [], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.getMrbsEntryId");
            cb(null, result);
        }
    })
};


mrbsDao.updateMrbsEntryId = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.mrbsClient, Query.UPDATE_MRBS_ENTRY_ID, [], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.updateMrbsEntryId");
            cb(null, result);
        }
    })
};


mrbsDao.insertMrbsEntry = function (startTime, endTime, entryType, repeatId, roomId, timestamp, createBy,
                                    name, type, description, cb) {
    pgSqlUtils.executeQuery(pgSqlService.mrbsClient, Query.INSERT_INTO_MRBS_ENTRY, [startTime, endTime, entryType, repeatId, roomId, timestamp, createBy,
        name, type, description], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.insertMrbsEntry");
            cb(null, result);
        }
    })
};


mrbsDao.fetchMeetingRooms = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.mrbsClient, Query.GET_ROOM_NAMES, [], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.fetchMeetingRooms");
            cb(null, result);
        }
    })
};

mrbsDao.fetchArea = function (cb) {
    pgSqlUtils.executeQuery(pgSqlService.mrbsClient, Query.GET_AREA, [], function (err, result) {
        if (err) {
            errLog.err("Error while connecting to " + pgSqlService.mrbsClient);
            cb(err, null);
        } else {
            logger.info("mrbsDao.fetchArea");
            cb(null, result);
        }
    })
};





module.exports = mrbsDao;