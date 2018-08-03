var crypto = require('crypto');
var session = require('../services/sessionService.js');
var redisConfig = require('../config/redisConfig');
var pgsqlService = require('../services/pgSqlService');
var pgSqlUtils = require('../utils/pgSqlUtils');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var nonAuthRoutes = require('../utils/constants').nonAuthRoutes;
var Query = require('../utils/queryConstants');
var pgSqlHelper = require('../helpers/pgSqlHelper');
var logger = require('../services/loggerService').infoLog;
var errLog = require('../services/loggerService').errorLog;
var config = require('../config/config');
var CryptoJS = require("crypto-js");
var sessionUtils = {};


/**
 *
 * @param userNameAsToken >> username from ldap login
 * @param cb              >> callback
 * usage                  >> used to set user session in redis
 */

sessionUtils.setUserSession = function (deviceId, userNameAsToken, cb) {
    //setuserSessions happens only on user login
    //set session in redis
    //key - username
    //value - user data from emp_master and emp_code_gen
//console.log("userNameAsToken >>"+userNameAsToken);
    pgSqlUtils.executeQuery(pgsqlService.offproClient, Query.GET_EMPLOYEE_DETAILS_BY_USERNAME, [userNameAsToken], function (err, userInfo) {
        if (err) {
            cb(err, null);
        } else {
            // console.log(JSON.stringify(userInfo));

            var reportsTo = userInfo[0] ? userInfo[0].reportsto : 0;
            pgSqlHelper.getEmpNameByEmpCode(reportsTo, function (err, approvedByName) {
                if (err) {
                    cb(err, null);
                } else {
                    userInfo[0].deviceId = deviceId;
                    userInfo[0].empId = userInfo[0].emp_code_entered.trim();
                    userInfo[0].approvedByName = approvedByName[0].emp_name;
                    userInfo[0].approvedByLoginName = approvedByName[0].login;
                    sessionUtils.genRandomToken(userInfo[0].empId, function (err, token) {
                        if (!err && token) {
                            userInfo[0].token = token;
                            //if logger in from postman as many sessions are created for as many user logins
                            //so first check if the session for the user exists
                            //if exists - rename the redisKey
                            //else create new session for the user
                            console.log("token on loggin >> " + token);
                            sessionUtils.checkSessionBasedOnLogInId(userInfo[0].empId, function (err, userExists) {
                                if (userExists) {
                                    //if user already exists in session then rename the user info to the session
                                    sessionUtils.renameRedisKey(userExists, token, userInfo, function (err, sessionRenamed) {
                                        if (err) {
                                            cb(err, null);
                                        } else {
                                            cb(null, userInfo);
                                        }
                                    })
                                } else {
                                    //else if there is no user session then create the new one
                                    sessionUtils.setRedisKey(token, userInfo, function (err, userFromRedis) {
                                        if (err) {
                                            cb(err, null);
                                        } else {
                                            cb(null, userInfo);
                                        }
                                    })
                                }
                            });
                        } else {
                            cb(flashMessage.error(Const.ERR_IN_GENERATING_TOKEN), null);
                        }
                    });
                }
            })
        }
    });
};

/**
 * @usage >> generating random token using crypto library
 */
sessionUtils.genRandomToken = function (loginId, cb) {
    crypto.randomBytes(40, function (err, buffer) {
        if (err) {
            cb(err, null);
        } else {
            //used to track manager DeviceId from session
            cb(null, buffer.toString('hex') + "+" + loginId.trim());
        }
    });
};

/**
 * @param key   >> redis key
 * @param value >> redis value
 * @param cb    >> callback
 */
sessionUtils.setRedisKey = function (tokenWithLoginId, value, cb) {
    session.mgr.SETEX(redisConfig.redis_session_key_prefix + ":" + tokenWithLoginId, redisConfig.redis_session_timeout_sec, JSON.stringify(value), function (err, result) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, result);
        }
    });
};

/**
 *
 * @param key >> key to search in redis
 * @param cb  >> callback
 * @returns   >> redis user from session
 */
sessionUtils.getRedisKey = function (key, cb) {
    session.mgr.GET(redisConfig.redis_session_key_prefix + ":" + key, function (err, result) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, JSON.parse(result));
        }
    })
};


/**
 *
 * @param key - redis token
 * @param cb - callback
 */
sessionUtils.deleteRedisKey = function (key, cb) {
    session.mgr.DEL(redisConfig.redis_session_key_prefix + ":" + key, function (err, deletedKeyFromRedis) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, true);
        }
    })
};

/**
 * @usage     >> this is used to perform handshake between tokens (verifying the token which is sent from client and
 *               session if the client token matches, then rename the token for every request)
 * @param key >> new redis key which is used to rename the existing key
 * @param cb  >> callback
 */
sessionUtils.renameRedisKey = function (oldKey, newKey, user, cb) {
    session.mgr.RENAME(redisConfig.redis_session_key_prefix + ":" + oldKey, redisConfig.redis_session_key_prefix + ":" + newKey, function (err, redisKeyRenamed) {
        if (err) {
            cb(err, null);
        } else {
            sessionUtils.setRedisKey(newKey, user, function (err, updatedValue) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, true);
                }
            })
        }
    })
};

/**
 *
 * @param token >> token which is used to find whether if this exists in session
 * @param cb    >> callback
 * @returns     >> bit value (0/1)
 */
sessionUtils.checkIfSessionExists = function (token, cb) {
    session.mgr.EXISTS(redisConfig.redis_session_key_prefix + ":" + token, function (err, tokenexists) {
        if (tokenexists) {
            cb(null, true);
        } else {
            cb(true, null);
        }
    })
};


/**
 * @usage     >> used to assign user object in all the request (verifies token from session and assigns the session user
 *               to req object so that all the request have access to user object which exists in session)
 * @param app >> express instance which is passed from app.js (passing app in the params allows developer to make req,res
 *              available in the middleware)
 */
var useragent = require('useragent');

sessionUtils.setMiddleware = function (app) {
    app.use(function (req, res, next) {
        //proceed only if it's authenticated call
        var userAgentCli = useragent.is(req.headers['user-agent']);
        sessionUtils.ifAuthReq(req, function (err, isValidReq) {
            if (isValidReq) {
                console.log("valid request");
                var token = req.headers['authorization'];
                logger.info('token >>> '+token);
                if (token) {
                    //add redis user to request
                    logger.info('getting redis key');
                    sessionUtils.getRedisKey(token, function (err, redisUser) {
                        if (redisUser && redisUser[0]) {
                            //rename key
                            //sessionUtils.perform
                            // TokenHandShake(token, redisUser, function (err, newToken) {
                                req.user = redisUser;
                                req.user[0].token = redisUser[0].token;
                                req.user[0].clientIsAndroid = userAgentCli.android;
                                /* do not remove this comment
                                 res.end = function (chunk, encoding) {
                                 };*/
                                next();
                            //});
                        } else {
                            errLog.err("first");
                            errLog.err("Error Invalid Token from middleware");
                            return res.json(flashMessage.error(Const.ERR_INVALID_TOKEN, {Error: err}));
                        }
                    });
                } else {
                    errLog.err("second");
                    return res.json(flashMessage.error(Const.ERR_MISSING_AUTHORIZATION_HEADER, {Error: err}));
                }
            } else {
                console.log("non auth request >>>>>>>>>>>>>>>>");
                logger.info("ignoring non-auth call - next()");
                //for non auth calls just return
                //but the request will not have token for non auth calls
                next();
            }
        });
    })
};


/**
 * not-used
 * not-used
 * @param authheader >> extracting the prefix key from request
 * @param cb         >> callback
 */
sessionUtils.extractTokenFromHeader = function (authheader, cb) {
    if (authheader) {
        cb(null, authheader.substring(6)); // Skip Token string
    } else {
        cb(true, null); // Skip Token string
    }
};


/**
 * @usage     >> used to validate whether the request is a authenticated call or non-auth call (bez for auth calls the token
 *               verification happens)
 * @param req >> the route is used from request to validate auth or non-auth calls
 * @param cb  >> callback
 */
sessionUtils.ifAuthReq = function (req, cb) {
    var qurl = req.url.split('?');
    var geturl = qurl[0].split('/');

    //logger.info("url-------------------");
    //logger.info(geturl);
    //logger.info(geturl[geturl.length - 2]);
    //logger.info(req.method);
    //logger.info(geturl[geturl.length - 2]);
    //logger.info("url----------------");
    //////cb(null, true);

    if (nonAuthRoutes.arr[(geturl[geturl.length - 1] ? geturl[geturl.length - 1] : geturl[geturl.length - 2]) + '_' + req.method] === true || nonAuthRoutes.arr[geturl[geturl.length - 1] + '_' + req.method] === true ||nonAuthRoutes.arr[geturl[geturl.length - 2] + '_' + req.method] === true || nonAuthRoutes.arr[geturl[geturl.length - 3] + '_' + req.method] === true) {
        logger.info("non auth call");
        cb(true, null);
    } else {
        logger.info(" auth call");
        cb(null, true);
    }
};


/**
 *
 * @param oldToken >> if the oldToken is valid then replace with the newOne
 * @param user     >> user from session
 * @param cb       >> callback
 */
sessionUtils.performTokenHandShake = function (key, user, cb) {
    //validate the given token for the user
    //if the token is valid >> generate new token and replace with old one
    sessionUtils.genRandomToken(user[0].emp_code_entered.trim(), function (err, newToken) {
        if (err) {
            cb(err, null);
        } else {
            if (config.displayToken) {
                logger.info("newToken >> " + newToken);
            }
            user[0].token = newToken;
            sessionUtils.renameRedisKey(key, newToken, user, function (err, result) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, newToken);
                }
            });
        }
    });
};

sessionUtils.checkSessionBasedOnLogInId = function (loginId, cb) {
    var prefix = redisConfig.redis_session_key_prefix + ':';
    //todo - if there are more than one session found then keep only one active session and delete remaining
    //session.mgr.KEYS("*+" + loginId.trim() + "*", function (err, keyExist) {*iLTS:**+1307*
    session.mgr.KEYS("*"+prefix+"**"+loginId.trim() +"*", function (err, keyExist) {
        if (keyExist[0]) {
            logger.info("checkSessionBasedOnLogInId >> "+keyExist[0]);
            cb(null, keyExist[0].substring(prefix.length));
        } else {
            cb(true, null);
        }
    })
};

sessionUtils.getUserToken = function (req, res) {
    var empId = req.params.empId;
    if (!empId) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT));
    }
    sessionUtils.checkSessionBasedOnLogInId(empId, function (err, redisUser) {
        if (err) {
            return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG));
        } else {
            if (redisUser) {
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Token: redisUser
                }));
            } else {
                return res.json(flashMessage.error(Const.ERR_SOMETHING_WENT_WRONG));
            }
        }
    })
};


module.exports = sessionUtils;





