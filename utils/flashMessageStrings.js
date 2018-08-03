var g_msg_string = [];
var status = [];

var Const = function () {
};

Const['string'] = '';

// Constants
Const.SUCCESS = 0;//1
Const.ERR_REQUIRED_MISSING_ARGUMENT = Const.SUCCESS + 1;//2
Const.ERR_IN_CONVERTING_PSW_TO_HASH = Const.ERR_REQUIRED_MISSING_ARGUMENT + 1;//3
Const.ERR_IN_SESSION_CREATION = Const.ERR_IN_CONVERTING_PSW_TO_HASH + 1;//4
Const.SUCCESS_SIGNUP = Const.ERR_IN_SESSION_CREATION + 1;//5
Const.ERR_IN_REDIS_MIDDLEWARE = Const.SUCCESS_SIGNUP + 1;//6
Const.SUCCESS_SIGNIN = Const.ERR_IN_REDIS_MIDDLEWARE + 1;//7
Const.ERR_INVALID_LOGIN = Const.SUCCESS_SIGNIN + 1;//8
Const.ERR_INVALID_TOKEN = Const.ERR_INVALID_LOGIN + 1;//9
Const.ERR_MISSING_AUTHORIZATION_HEADER = Const.ERR_INVALID_TOKEN + 1;//10
Const.ERR_USER_ALREADY_EXIST = Const.ERR_MISSING_AUTHORIZATION_HEADER + 1;//11
Const.ERR_IN_ACCESSING_SESSION = Const.ERR_USER_ALREADY_EXIST + 1;//12
Const.ERR_MISSING_FILE = Const.ERR_IN_ACCESSING_SESSION + 1;//13
Const.ERR_INVALID_FILE = Const.ERR_MISSING_FILE + 1;//14
Const.ERR_INVALID_USER = Const.ERR_INVALID_FILE + 1;//15
Const.ERR_NOT_FOUND = Const.ERR_INVALID_USER + 1;//16
Const.ERR_INVALID_EXPORT = Const.ERR_NOT_FOUND + 1;//17
Const.ERR_DATA_EXISTS = Const.ERR_INVALID_EXPORT + 1;//18
Const.ERR_SOMETHING_WENT_WRONG = Const.ERR_DATA_EXISTS + 1;//19
Const.ERR_ENTRY_ALREADY_EXISTS = Const.ERR_SOMETHING_WENT_WRONG + 1;//20
Const.ERR_FILE_NOT_FOUND = Const.ERR_ENTRY_ALREADY_EXISTS + 1;//21
Const.ERR_IN_GENERATING_TOKEN = Const.ERR_FILE_NOT_FOUND + 1;//22
Const.ERR_AUTH_HEADER_MISSING = Const.ERR_IN_GENERATING_TOKEN + 1;//23
Const.ERR_INVALID_LEAVE_TYPE = Const.ERR_AUTH_HEADER_MISSING + 1;//24
Const.ERR_IN_GETTING_LEAVE_HISTORY = Const.ERR_INVALID_LEAVE_TYPE + 1;//25
Const.ERR_IN_GETTING_HOLIDAY_LIST = Const.ERR_IN_GETTING_LEAVE_HISTORY + 1;//26
Const.ERR_INVALID_LEAVE_ACTION = Const.ERR_IN_GETTING_HOLIDAY_LIST + 1;//27
Const.ERR_INVALID_PARAMS = Const.ERR_INVALID_LEAVE_ACTION + 1;//28
Const.ERR_INVALID_EMP_ID = Const.ERR_INVALID_PARAMS + 1;//29
Const.INFO_NO_RESULTS_FOUND = Const.ERR_INVALID_EMP_ID + 1;//30
Const.ERR_IN_SENDING_MAIL = Const.INFO_NO_RESULTS_FOUND + 1;//31
Const.ERR_IN_VALIDATING_REQUEST_LEAVES = Const.ERR_IN_SENDING_MAIL + 1;//32
Const.SUCCESS_ADDED_SUCCESSFULLY = Const.ERR_IN_VALIDATING_REQUEST_LEAVES + 1;//33
Const.USER_NOT_ELIGIBLE_FOR_LEAVE = Const.SUCCESS_ADDED_SUCCESSFULLY + 1;//33
Const.ERR_OVERLAPPING_DATES = Const.USER_NOT_ELIGIBLE_FOR_LEAVE + 1;//34
Const.ERR_WEEKEND = Const.ERR_OVERLAPPING_DATES + 1;//34

/// Messages

g_msg_string[Const.ERR_WEEKEND] = "Can not book room on weekends";//33
g_msg_string[Const.ERR_OVERLAPPING_DATES] = "Leave duration of this leave is overlapping with previous leaves in leave history";//33
g_msg_string[Const.USER_NOT_ELIGIBLE_FOR_LEAVE] = "You Don't Have Leave Balance To Avail Leave Try Changing Leave Type";//33
g_msg_string[Const.SUCCESS_ADDED_SUCCESSFULLY] = "Added Successfully";//33
g_msg_string[Const.ERR_IN_VALIDATING_REQUEST_LEAVES] = "Error Leave Already Applied For the Same Dates";//32
g_msg_string[Const.ERR_IN_SENDING_MAIL] = "Error in sending Email";//31
g_msg_string[Const.INFO_NO_RESULTS_FOUND] = "No Results Found";//30
g_msg_string[Const.ERR_INVALID_EMP_ID] = "Error Invalid Employee Id";//29
g_msg_string[Const.ERR_INVALID_PARAMS] = "Error Invalid Params";//28
g_msg_string[Const.ERR_INVALID_LEAVE_ACTION] = "Error Invalid Leave Action";//27
g_msg_string[Const.ERR_IN_GETTING_HOLIDAY_LIST] = "Error In Getting Holiday List";//26
g_msg_string[Const.ERR_IN_GETTING_LEAVE_HISTORY] = "Error In Getting Leave History";//25
g_msg_string[Const.ERR_INVALID_LEAVE_TYPE] = "Error Invalid Leave Type";//24
g_msg_string[Const.ERR_AUTH_HEADER_MISSING] = "Missing Authorization Header.";//23
g_msg_string[Const.ERR_IN_GENERATING_TOKEN] = "Error In Generating Token";//22
g_msg_string[Const.ERR_FILE_NOT_FOUND] = "Error File Not Found";//21
g_msg_string[Const.ERR_ENTRY_ALREADY_EXISTS] = "Error Entry Already Exists";//20
g_msg_string[Const.ERR_SOMETHING_WENT_WRONG] = "Error Something Went Wrong";//19
g_msg_string[Const.ERR_DATA_EXISTS] = "Error Data Already Exists";//18
g_msg_string[Const.ERR_INVALID_EXPORT] = "Error Invalid Export";//17
g_msg_string[Const.ERR_NOT_FOUND] = "Error Not Found";//16
g_msg_string[Const.ERR_INVALID_USER] = "Error Invalid User";//15
g_msg_string[Const.ERR_INVALID_FILE] = "Error Invalid File";//14
g_msg_string[Const.ERR_MISSING_FILE] = "Error Missing File";//13
g_msg_string[Const.ERR_IN_ACCESSING_SESSION] = "Error In Accessing Session";//12
g_msg_string[Const.ERR_USER_ALREADY_EXIST] = "Error User Already Exist";//11
g_msg_string[Const.ERR_MISSING_AUTHORIZATION_HEADER] = "Error Missing Authorization Header";//10
g_msg_string[Const.ERR_INVALID_TOKEN] = "Something Went Wrong";//9
g_msg_string[Const.ERR_INVALID_LOGIN] = "Error Invalid Login";//8
g_msg_string[Const.SUCCESS_SIGNIN] = "Signin Success";//7
g_msg_string[Const.ERR_IN_REDIS_MIDDLEWARE] = "Error In Redis Middleware";//6
g_msg_string[Const.SUCCESS_SIGNUP] = "Signup Success";//5
g_msg_string[Const.ERR_IN_SESSION_CREATION] = "Error In Session Creation";//4
g_msg_string[Const.ERR_IN_CONVERTING_PSW_TO_HASH] = "Error In Converting Password To Hash";//3
g_msg_string[Const.ERR_REQUIRED_MISSING_ARGUMENT] = "Error Missing Required Argument";//2
g_msg_string[Const.SUCCESS] = "Success";//1


//status code
status[Const.SUCCESS] = 200;
status[Const.INFO_NO_RESULTS_FOUND] = 200;

status[Const.ERR_REQUIRED_MISSING_ARGUMENT] = 404;
status[Const.ERR_IN_CONVERTING_PSW_TO_HASH] = 404;
status[Const.ERR_IN_SESSION_CREATION] = 404;
status[Const.SUCCESS_SIGNUP] = 200;
status[Const.ERR_IN_REDIS_MIDDLEWARE] = 404;
status[Const.SUCCESS_SIGNIN] = 200;
status[Const.ERR_MISSING_AUTHORIZATION_HEADER] = 404;
status[Const.ERR_USER_ALREADY_EXIST] = 404;
status[Const.ERR_IN_ACCESSING_SESSION] = 404;
status[Const.ERR_INVALID_TOKEN] = 404;
status[Const.ERR_INVALID_LOGIN] = 404;
status[Const.ERR_MISSING_FILE] = 404;
status[Const.ERR_INVALID_FILE] = 404;
status[Const.ERR_INVALID_USER] = 404;
status[Const.ERR_NOT_FOUND] = 404;
status[Const.ERR_INVALID_EXPORT] = 404;
status[Const.ERR_DATA_EXISTS] = 404;
status[Const.ERR_SOMETHING_WENT_WRONG] = 404;
status[Const.ERR_ENTRY_ALREADY_EXISTS] = 404;
status[Const.ERR_FILE_NOT_FOUND] = 404;
status[Const.ERR_IN_GENERATING_TOKEN] = 404;
status[Const.ERR_AUTH_HEADER_MISSING] = 404;
status[Const.ERR_INVALID_LEAVE_TYPE] = 404;
status[Const.ERR_IN_GETTING_LEAVE_HISTORY] = 404;
status[Const.ERR_IN_GETTING_HOLIDAY_LIST] = 404;
status[Const.ERR_INVALID_LEAVE_ACTION] = 404;
status[Const.ERR_INVALID_PARAMS] = 404;
status[Const.ERR_INVALID_EMP_ID] = 404;
status[Const.ERR_IN_SENDING_MAIL] = 500;
status[Const.ERR_IN_VALIDATING_REQUEST_LEAVES] = 500;
status[Const.SUCCESS_ADDED_SUCCESSFULLY] = 200;
status[Const.USER_NOT_ELIGIBLE_FOR_LEAVE] = 500;
status[Const.ERR_OVERLAPPING_DATES] = 500;


module.exports.status = status;
module.exports.g_msg = g_msg_string;
module.exports.CONST = Const;

