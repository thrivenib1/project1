// All the Querys are configured to QueryConstants

var Query = function () {
};

Query.GET_EMPNAME_BY_EMPCODE = 'select emp_name,login,emp_code_entered from emp_master T1 inner join emp_code_gen T2 ' +
    'on T1.emp_code = T2.emp_code and T1.emp_code =$1';
Query.FETCH_HOLIDAY_LIST = 'select * from holiday_list as T1 where extract(year from T1.day)=$1 order by day';
Query.FETCH_LEAVE_HISTORY = 'select * from leave_details T1 inner join leave_result T2' +
    ' on T1.req_no=T2.req_no and T1.emp_code=$1' +
    ' and extract(year from T2.leave_start_date)>=$2 order by T2.leave_start_date desc, T1.req_no desc;';
Query.INC_REQUEST_NUMBER = 'update inc_reqno set inc_id=$1';
Query.INC_SL_NUMBER = 'update inc_slno set sl_no=$1';
Query.GET_REQUEST_NUMBER = 'select * from inc_reqno';
Query.GET_SL_NUMBER = 'select * from inc_slno';
Query.INSERT_INTO_LEAVE_DETAILS = 'Insert into leave_details (req_no,emp_code,req_date,reason,leave_type,approved_by) ' +
    'values ($1,$2,$3,$4,$5,$6)';
Query.INSERT_INTO_LEAVE_RESULT = 'Insert into leave_result (req_no,leave_start_date,leave_end_date,contact_details,phone_no,no_leaves,appr, rej , cons) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
Query.INSERT_INTO_LEAVE_RESULT_FOR_LEAVETYPE_3 = 'Insert into leave_result ' +
    '(req_no,leave_start_date,leave_end_date,contact_details,comp_start_date,comp_end_date,phone_no,no_leaves,appr, rej , cons) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';
Query.GET_EMPLOYEE_DETAILS_BY_USERNAME = 'SELECT * from emp_master inner join emp_code_gen ' +
    'on emp_master.emp_code = emp_code_gen.emp_code where emp_master.login =$1';
Query.GET_LEAVE_BALANCE_BY_YEAR = 'select * from leave_at_hand where year=$1';
Query.GET_LEAVE_BALANCE_BY_EMPCODE = 'select * from leave_at_hand where emp_code=$1';
Query.FETCH_EMP_UNDER_REPORTING_HEAD = 'SELECT * from emp_master inner join emp_code_gen ' +
    'on emp_master.emp_code = emp_code_gen.emp_code where emp_master.reportsto=$1';
Query.INSERT_INTO_LEAVE_CREDIT = 'Insert into leave_credit ' +
    '(slno,emp_code,leave_no_pl,leave_no_cl,entry_time,reason,year,entry_by) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8)';
Query.INSERT_INTO_LEAVE_DEBIT = 'Insert into leave_debit ' +
    '(slno,emp_code,leave_no_pl,leave_no_cl,entry_time,reason,year,entry_by) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8)';
Query.GET_LEAVE_BALANCE_OF_EMPLOYEE = 'select * from leave_at_hand where emp_code=$1 and year=$2';
Query.GET_EMPCODE_BY_EMPID = 'select emp_code from emp_code_gen where emp_code_entered=$1';
Query.FETCH_EMPLOYEE_LIST = 'select emp_code_entered,emp_name from emp_master t1 inner join emp_code_gen t2 ' +
    'on t1.emp_code=t2.emp_code order by t1.emp_name';
Query.INSERT_INTO_MEDICAL_REIMBURSEMENT = 'Insert into medical_reimbursement ' +
    '(billDate,amount,billNumber,referenceNumber,empCode) ' +
    'values ($1,$2,$3,$4,$5)';
Query.INSERT_INTO_PETROL_REIMBURSEMENT = 'Insert into petrol_reimbursement ' +
    '(billDate,amount,billNumber,referenceNumber,empCode) ' +
    'values ($1,$2,$3,$4,$5)';
Query.USER_LOGIN = 'Select * from login_user where username=$1 and password=$2';
Query.FETCH_RECENT_LEAVE_HISTORY = 'select * from leave_details T1 inner join leave_result T2' +
    ' on T1.req_no=T2.req_no and T1.emp_code=$1' +
    ' order by T2.leave_start_date desc limit 10';
Query.FETCH_LEAVE_HISTORY_BETWEEN_DATES = 'select * from leave_details T1 inner join leave_result T2' +
    ' on T1.req_no=T2.req_no and T1.emp_code=$1 and T2.leave_start_date between $2 and $3' +
    ' order by T2.leave_start_date desc';
Query.APPROVE_LEAVE_IN_LEAVE_RESULT = 'update leave_result set appr=$1 where req_no=$2';
Query.APPROVE_LEAVE_IN_LEAVE_DETAILS = 'update leave_details set comments=$1 , approved_by=$2 where req_no=$3';
Query.REJECT_LEAVE_IN_LEAVE_RESULT = 'update leave_result set rej=$1 where req_no=$2';
Query.REJECT_LEAVE_IN_LEAVE_DETAILS = 'update leave_details set comments=$1 , approved_by=$2 where req_no=$3';
Query.GET_DEPARTMENT = 'select bu_desc from bu_master where bu_code=$1';
Query.CANCEL_LEAVE_IN_LEAVE_RESULT = 'update leave_result set cancel=$1 where req_no=$2';
Query.UPDATE_LEAVE_DETAILS = 'update leave_details set mod_req_date=$2,reason=$3,leave_type=$4 where req_no=$1';
Query.UPDATE_LEAVE_RESULT_FOR_LEAVETYPE_3 = 'update leave_result set leave_start_date=$2,leave_end_date=$3,' +
    ' contact_details=$4,comp_start_date=$5,comp_end_date=$6,phone_no=$7,no_leaves=$8 where req_no=$1';
Query.UPDATE_LEAVE_RESULT = 'update leave_result set leave_start_date=$2,leave_end_date=$3,contact_details=$4,' +
    ' phone_no=$5,no_leaves=$6 where req_no=$1';
Query.FETCH_LEAVES_TO_APPROVE = 'select * from leave_details T1 inner join leave_result T2' +
    ' on T1.req_no=T2.req_no and T1.approved_by=$1 and ' +
    '(T2.appr=false or T2.appr is null) and (T2.rej=false or T2.rej is null) and ' +
    '(T2.cancel=false or T2.cancel is null) order by T1.req_date';

Query.FETCH_LEAVE_START_AND_END_DATE = "select * from leave_result where req_no=$1";
Query.VALIDATE_REQUEST_LEAVE_DATES = "select * from leave_result where leave_start_date=$1 and leave_end_date=$2";
Query.GET_LEAVE_TYPE = "select * from leave_details where req_no = $1";
Query.DEDUCT_CL_LEAVE = "update leave_at_hand SET  c_leave=$1 WHERE emp_code=$2 and year=$3";
Query.DEDUCT_PL_LEAVE = "update leave_at_hand SET  p_leave=$1 WHERE emp_code=$2 and year=$3";
Query.VALIDATE_FROM_DATE = "select * from leave_result where leave_start_date=$1";
Query.VALIDATE_END_DATE = "select * from leave_result where leave_end_date=$1";
//Query.VALIDATE_BETWEEN_DATES = "select * from leave_result lr INNER JOIN leave_details ld ON ld.req_no = lr.req_no and leave_start_date between $1 and $2 or leave_start_date between $2 and $1 or leave_end_date between $3 and $4 or leave_end_date between $4 and $3 where emp_code=$5";
Query.GET_EMP_CODE_FROM_LEAVE_DETAILS = "select emp_code from leave_details where req_no=$1";
Query.GET_EMPID_BY_REQ_NO = "select emp_code from leave_details where req_no=$1";
Query.GET_EMP_CODE_BY_EMP_ID = "select * from emp_master where emp_code=$1";
Query.GET_MANAGER_EMP_CODE = "select * from emp_master where login=$1";
Query.GET_MANAGER_EMP_ID = "select * from emp_code_gen where emp_code=$1";
Query.VALIDATE_BETWEEN_DATES = "select * from leave_result lr INNER JOIN leave_details ld ON ld.req_no = lr.req_no where ld.emp_code=$1 and lr.cancel is NULL and lr.rej='f'";
Query.VALIDATE_COMPENSATION_LEAVES = "select * from leave_result lr INNER JOIN leave_details ld ON ld.req_no = lr.req_no where ld.emp_code=$1 and lr.cancel is NULL and lr.rej='f'";
Query.VALIDATE_COMPENSATION_LEAVES_FOR_UPDATE = "select * from leave_result lr INNER JOIN leave_details ld ON ld.req_no = lr.req_no where ld.emp_code=$1 and lr.cancel is NULL and lr.rej='f' and lr.req_no != $2";
Query.VALIDATE_BETWEEN_DATES_FOR_UPDATE = "select * from leave_result lr INNER JOIN leave_details ld ON ld.req_no = lr.req_no where ld.emp_code=$1 and lr.cancel is NULL and and lr.rej='f' and lr.req_no != $2";
Query.GET_EMP_DOB = "select to_char(ed.date_of_birth, 'DD-MM') as DM ,ed.emp_code,ed.gender,ed.martial_status,ed.blood_group,ed.pan,ed.aadhar,ed.passport,ed.personal_email,ed.imss_email,ed.address_permanent,ed.address_present,ed.emergency_contact_person,ed.emergency_contact_number,ed.qualification,ed.date_of_birth from emp_details ed INNER JOIN emp_master em on em.emp_code = ed.emp_code where to_char(ed.date_of_birth, 'DD-MM')=$1 and em.left_date is null";
Query.GET_EMP_PROFILE_DETAILS = "select * from emp_details where emp_code=$1";
Query.GET_DESIGNATION_FROM_ABBREVATION = "select * from designation where desg_code=$1";
//Query.GET_EMP_CONTACT_DETAILS = "select * from emp_details";
Query.GET_EMP_CONTACT_DETAILS = "select * from emp_details t1 inner join emp_code_gen t2 on t1.emp_code=t2.emp_code";


module.exports = Query;
