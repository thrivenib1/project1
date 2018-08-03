var ldapConfig = require('../config/ldapConfig');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var logger = require('../services/loggerService').infoLog;
var debugLog = require('../services/loggerService').debugLog;
var ldapMgr = require('../services/ldapService');
var ldapHelper = function () {
};

//ldap authenticate requires admin DN and admin credentials
ldapHelper.adminAuthenticate = function (cb) {
    ldapMgr.client.bind(ldapConfig.adminLdapDn, ldapConfig.adminLdapCredentials, [], function (err, result) {
        if (err) {
            cb(flashMessage.error(Const.ERR_INVALID_LOGIN, {ERR: err}), null);
        } else {
            if (ldapHelper.validateLdapStatusCode(result.status)) {
                cb(null, flashMessage.success(Const.SUCCESS, {result: JSON.parse(result)}));
            } else {
                logger.info("ldapHelper : error in authenticate status missMatch " + result.status);
                cb(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {result: result.status}));
            }
        }
    })
};

//ldap user authenticate requires user DN and user credentials
ldapHelper.userAuthenticate = function (userDN, password, cb) {
    logger.info("inside ldapHelper.userAuthenticate");

    ldapMgr.client.bind(userDN, password, [], function (err, result) {
        if (err) {
            console.log(err);
            logger.info("err in ldap bind >> " + err);
            cb(flashMessage.error(Const.ERR_INVALID_LOGIN, {ERR: err}), null);
        } else {
            if (ldapHelper.validateLdapStatusCode(result.status)) {
                cb(null, flashMessage.success(Const.SUCCESS, {result: JSON.parse(result)}));
            } else {
                logger.info("ldapHelper : error in userAuthenticate status missMatch " + result.status);
                cb(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {result: result.status}));
            }
        }
    });
};
/**
 * @usage           >> adding ldap user to ldap server
 * @param userName  >> firstname in ldap server(mandatory)
 * @param lastName  >> lastname in ldap server(mandatory)
 * @param password  >> password in ldap server(mandatory)
 * @param cb
 */

//adding user to specific group in integra
ldapHelper.addUserInternal = function (userName, lastName, password, cb) {
    var entry = {cn: userName, sn: lastName, userPassword: password, objectclass: ldapConfig.objectClass};
    ldapMgr.client.add(ldapConfig.ldapBind + userName + ldapConfig.ldapDN, entry, function (err, result) {
        if (err) {
            cb(err, null);
        } else {
            if (ldapHelper.validateLdapStatusCode(result.status)) {
                cb(null, flashMessage.success(Const.SUCCESS, {result: JSON.parse(result)}));
            } else {
                logger.info("ldapHelper : error in addUserInternal status missMatch" + result.status);
                cb(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {result: result.status}));
            }
        }
    });
};

ldapHelper.addLdapUser = function (req, cb) {

    var userName = req.body.username;
    var lastName = req.body.lastname;
    var password = req.body.password;

    //username,lastname and password all are mandatory fields
    if (!userName || !lastName || !password) {
        cb(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT), null);
    }
    //to perform any action to ldap server first we need to authenticate admin

    //to add a user to ldap server first the connection should establish with admin authenticate
    ldapHelper.adminAuthenticate(function (err, authenticated) {
        if (err) {
            cb(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {Error: err}), null);
        } else {
            ldapHelper.addUserInternal(userName, lastName, password, function (err, result) {
                if (err) {
                    debugLog.debug("Error in add user to ldap server >> error message " + err);
                    cb(flashMessage.error(Const.ERR_ENTRY_ALREADY_EXISTS, {Error: err}), null);
                } else {
                    cb(null, flashMessage.success(Const.SUCCESS, {Result: result}));
                }
            })
        }
    });
};

//deleting user to specific group in integra
ldapHelper.deleteUser = function (userName, cb) {
    ldapMgr.client.del(ldapConfig.ldapBind + userName + ldapConfig.ldapDN, function (err, result) {
        if (err) {
            cb(err, null);
        } else {
            if (ldapHelper.validateLdapStatusCode(result.status)) {
                cb(null, flashMessage.success(Const.SUCCESS, {result: JSON.parse(result)}));
            } else {
                logger.info("ldapHelper : error in deleteUser status missMatch" + result.status);
                cb(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG, {result: result.status}));
            }
        }
    });
};

//todo - unbinding is inComplete

ldapHelper.validateLdapStatusCode = function (statusCode) {
    return statusCode == 0 ? true : false;
};


module.exports = ldapHelper;