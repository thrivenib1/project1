var express = require('express');
var router = express.Router();
var ldapHelper = require('../helpers/ldapHelper');
var flashMessage = require('../utils/flashMessageUtils');
var Const = require('../utils/flashMessageStrings').CONST;
var logger = require('../services/loggerService').logger;
var uploadHelper = require('../helpers/uploadHelper');
var ldapMgr = require('../services/ldapService');
var feedbackCtr = require('../controllers/feedbackController');
var sessionUtils = require('../utils/sessionUtils');
var multer = require('multer');
var userCtr = require('../controllers/userController');
var fcmCtr = require('../controllers/fcmController');

//adding user to ldap server
router.post('/addUser', ldapMgr.initLdapMgr, function (req, res, next) {
    ldapHelper.addLdapUser(req, function (err, result) {
        if (err) {
            return res.json(err);
        } else {
            return res.json(result);
        }
    });
});


router.post('/:empId/profilePic/upload', function (req, res, next) {

    if (!req.files || !req.files.avatar) {
        return res.json(flashMessage.error(Const.ERR_REQUIRED_MISSING_ARGUMENT, {Token: req.user[0].token}));
    }
    var avatar = req.files.avatar;
    var filename = req.user[0].empId + ".png";

    if (req.params.empId && req.params.empId == req.user[0].empId) {
        avatar.mv('../public/images/profile/' + filename, function (err) {
            if (err) {
                return res.json({status: 404, Token: req.user[0].token});
            } else {
                return res.json(flashMessage.success(Const.SUCCESS, {
                    Result: filename,
                    Token: req.user[0].token
                }));
            }
        });
    } else {
        return res.json(flashMessage.error(Const.ERR_INVALID_EMP_ID, {Token: req.user[0].token}));
    }
});


router.post('/addFeedback', feedbackCtr.addFeedback, function (req, res, next) {
    next();
});

router.get('/:empId/getUserToken', sessionUtils.getUserToken, function (req, res, next) {
    next();
});

router.post('/testMail', userCtr.testMail, function (req, res, next) {
    next();
});

router.post('/testGCM', fcmCtr.testGCMnotification, function (req, res, next) {
    next();
});

router.post('/testGCM', fcmCtr.testIOSnotification, function (req, res, next) {
    next();
});


router.get('/getEmpNameByEmpCode/:empcode', userCtr.getEmpNameByEmpCode, function (req, res, next) {
    next();
});


router.get('/getEmpContactDetails', userCtr.getEmpContactDetails, function (req, res, next) {
    next();
});
module.exports = router;
