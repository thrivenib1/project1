module.exports = {
    gcmdispatch: 'gcmdispatch',
    gcmfailures: 'gcmfailures',
    medical_reimbursement: 'medical_reimbursement',
    petrol_reimbursement: 'petrol_reimbursement',
    feedback: 'feedback',
    notification: 'notification',
    user: 'user',
    email: 'email',
    leave: 'leave',
    admin: 'admin',
    adminId: '1eadfeed1eadfeed1eadfeed'
};


var nonAuthRoutes = function () {
};

//all non-auth calls inside array
nonAuthRoutes.arr = [];
nonAuthRoutes.arr['login_POST'] = true; //the route_httpMethod
nonAuthRoutes.arr['addUser_POST'] = true; //the route_httpMethod
nonAuthRoutes.arr['getUserToken_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['testGCM_POST'] = true; //the route_httpMethod
nonAuthRoutes.arr['testMail_POST'] = true; //the route_httpMethod
nonAuthRoutes.arr['IMSWiki_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['qms_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['IMSS_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['IMSWiki_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['ILTS_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['ilts_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['QMS_GET'] = true; //the route_httpMethod
nonAuthRoutes.arr['qms_POST'] = true; //the route_httpMethod
nonAuthRoutes.arr['IMSWiki_GET'] = true; //the route_httpMethod



var leaveTypes = function () {
};

leaveTypes[1] = "Casual Leave";
leaveTypes[2] = "LTC";
leaveTypes[3] = "Compensatory";
leaveTypes[4] = "Privilege Leave";
leaveTypes[5] = "Maternity";

//var allowedLeaveTypes = [1, 2, 3, 4, 5];

var leaveTitle = function () {
};

leaveTitle["Request_Leave"] = "Request Leave";
leaveTitle["Cancel_Leave"] = "Cancel Leave";
leaveTitle["Approve_Leave"] = "Approve Leave";
leaveTitle["Reject_Leave"] = "Reject Leave";
leaveTitle["Update_Leave"] = "Update Leave";


module.exports.leaveTypes = leaveTypes;
module.exports.nonAuthRoutes = nonAuthRoutes;
module.exports.leaveTitle = leaveTitle;
//module.exports.allowedLeaveTypes = allowedLeaveTypes;
