var logger = require('../services/loggerService').infoLog;
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var errLog = require('../services/loggerService').errorLog;
var mrbsDao = require('../DAO/mrbsDao');
var mrbsHelper = require('../helpers/mrbsHelper');

var mrbsController = function () {
};

/**
 * @param req
 * @param res
 *
 * Inserting to mrbs_entry table (inputs from request all are mandatory)
 * id - auto incremented and corresponding mrbs_entry_id_seq table is updated
 * id - nextval(('"mrbs_entry_id_seq"'::text)::regclass) -- > modifiers in mrbs_entry table
 *
 */

mrbsController.bookRoom = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    //var areaId = req.body.areaId;
    var roomId = req.body.roomId;
    //get roomName by roomId and areaId
    var timestamp = req.body.timestamp;
    //entrytype should be either I/E
    var entryType = req.body.entryType;
    //repeatId is 0/1 for one day room booking
    var repeatId = req.body.repeatId;
    // repeat_id(nr) , room_id(name) , timestamp
    var createBy = req.user[0].login.trim();//(login)
    var name = req.body.name;//(title)
    var description = req.body.description;
    var type = req.body.type;

    if (!startTime || !endTime || !roomId || !timestamp || !entryType || !repeatId || !name || !description || !type) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }

    mrbsHelper.checkIfWeekend(startTime, endTime, function (err, weekend) {
        if (weekend) {
            return res.json(flashMessage.error(Const.ERR_WEEKEND, {Token: req.user[0].token}));
        } else {
            mrbsDao.insertMrbsEntry(startTime, endTime, entryType, repeatId, roomId, timestamp, createBy,
                name, type, description, function (err, result) {
                    if (err) {
                        errLog.err("error in mrbsController.bookRoom" + err);
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
                    } else {
                        logger.info("success in mrbsController.bookRoom");
                        return res.json(flashMessage.success(Const.SUCCESS, {
                            Result: result,
                            Token: req.user[0].token
                        }));
                    }
                })
        }
    });
};

/**
 *
 * @param req
 * @param res - getting rooms details from mrbs_room table
 *
 */
mrbsController.getRoomNames = function (req, res) {
    mrbsDao.fetchMeetingRooms(function (err, result) {
        if (err) {
            errLog.err("error in mrbsController.getRoomNames" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in mrbsController.getRoomNames");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};

/**
 *
 * @param req
 * @param res
 *
 * getting area details from mrbs_area table
 */

mrbsController.getArea = function (req, res) {
    mrbsDao.fetchArea(function (err, result) {
        if (err) {
            errLog.err("error in mrbsController.getRoomNames" + err);
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Token: req.user[0].token}));
        } else {
            logger.info("success in mrbsController.getArea");
            return res.json(flashMessage.success(Const.SUCCESS, {
                Result: result,
                Token: req.user[0].token
            }));
        }
    })
};




module.exports = mrbsController;