var express = require('express');
var router = express.Router();
var ldapService = require('../services/ldapService');
var notiController = require('../controllers/notificationController');

//creating inApp Notifications
router.post('/createInAppNoti', notiController.sendNotificationForAllIntegrans, function (req, res, next) {
    next();
});


router.get('/getInAppNoti', notiController.getNotificationList, function (req, res, next) {
    next();
});

router.get('/getNotificationNumber', notiController.getNotificationNumber, function (req, res, next) {
    next();
});

router.get('/markNotificationAsRead', notiController.markNotificationAsRead, function (req, res, next) {
    next();
});


module.exports = router;
