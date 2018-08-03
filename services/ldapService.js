var ldap = require('ldapjs');
var ldapConfig = require('../config/ldapConfig');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var userHelper = require('../helpers/userHelper');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var config = require('../config/config');
var ldapMgr = function () {
};

ldapMgr.initLdapMgr = function (req, res, next) {

    logger.info("Initializing ldap");

    ldapMgr.client = ldap.createClient({url: ldapConfig.ldapUrl});

    ldapMgr.client.on('connect', function () {
        logger.info("ldap connected on port >> " + ldapConfig.ldapUrl);
        next();
    });
    ldapMgr.client.on('error', function () {
        errLog.err("ldap unable to connect on port >> " + ldapConfig.ldapUrl);
        logger.info("User authentication via Db");
        //it is used only for dev purpose
        //this is used when there is issue in connecting to ldap server we try authenticate user from db
        if (config.isLocal) {
            if (req.body.username && req.body.password) {
                var username = req.body.username.split("@")[0];
                username = username.toLowerCase();
                userHelper.loginFromDb(username, req.body.password, req.body.deviceId, function (err, result) {
                    if (err) {
                        return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}));
                    } else {
                        return res.json(flashMessage.success(Const.SUCCESS, {Result: result}));
                    }
                })
            } else {
                next();
            }
        } else {
            next();
        }
    });
};


module.exports = ldapMgr;








