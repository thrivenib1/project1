var express = require('express');
var router = express.Router();
var ldapService = require('../services/ldapService');
var userController = require('../controllers/userController');
var leaveController = require('../controllers/leaveController');
var logger = require('../services/loggerService').infoLog;



router.get('/login',function (req, res) {
    logger.info("get login >>");
    res.render("login.html")
});

//ldap user login
router.post('/login', ldapService.initLdapMgr, userController.login, function (req, res, next) {
    logger.info("post login >>");
    next();
});


//logout
router.get('/logout', userController.logOut, function (req, res, next) {
    console.log("logoutlogoutlogout");
    res.render("login.html")
});

//getHolidayListOfDates
router.get('/getHolidayListOfDates', leaveController.getHolidayListOfDates, function (req, res, next) {
    next();
});


module.exports = router;
