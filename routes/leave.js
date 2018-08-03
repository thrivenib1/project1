var express = require('express');
var router = express.Router();
var leaveController = require('../controllers/leaveController');

router.post('/requestLeave', leaveController.requestLeave, function (req, res, next) {
    next();
});

router.get('/leaveHistory', leaveController.getLeaveHistory, function (req, res, next) {
    next();
});

router.get('/leaveHistory/:empcode', leaveController.getIndividualLeaveHistory, function (req, res, next) {
    next();
});

router.get('/holidayList/:year', leaveController.getHolidayList, function (req, res, next) {
    next();
});

router.post('/recentLeaveHistory', leaveController.getRecentLeaveHistory, function (req, res, next) {
    next();
});

router.post('/leaveHistoryBetweenDates', leaveController.getLeaveHistoryBetweenDates, function (req, res, next) {
    next();
});

router.post('/leaveBalanceOfEmployee', leaveController.getLeaveBalanceOfEmployee, function (req, res, next) {
    next();
});

router.post('/cancelLeave', leaveController.cancelLeave, function (req, res, next) {
    next();
});

router.post('/updateLeave', leaveController.updateLeaveRequest, function (req, res, next) {
    next();
});

module.exports = router;

/*
 $q_str = "INSERT INTO leave_details(req_no,emp_code,req_date,reason,approved_by,leave_type) VALUES ($req_no,$emp_code,'$req_date','$reason',$approved_by,$leave_type)";


 $q_str = "INSERT INTO leave_result(req_no,leave_start_date,leave_end_date,contact_details,phone_no,appr,rej,cons,no_leaves)VALUES($req_no,'$leave_start_date','$leave_end_date','$contact_details','$phone_no','f','f','f',$no_days)";


 For comp off leaves

 if($comp_date_1 || $comp_date_2 || $comp_date_3)
 {
 $leave_comp_save = pg_exec($db_leave,"INSERT INTO comp_dates(req_no)VALUES($req_no)");
 if($comp_date_1)
 $leave_comp_save = pg_exec($db_leave,"UPDATE comp_dates SET comp_date_1='$comp_date_1' where req_no=$req_no");
 if($comp_date_2)
 $leave_comp_save = pg_exec($db_leave,"UPDATE comp_dates SET comp_date_2='$comp_date_2' where req_no=$req_no");
 if($comp_date_3)
 $leave_comp_save = pg_exec($db_leave,"UPDATE comp_dates SET comp_date_3='$comp_date_3' where req_no=$req_no");
 }


 select ld.*, lr.* from leave_details ld INNER JOIN leave_result lr ON lr.req_no = ld.req_no where ld.req_no=31657*/
