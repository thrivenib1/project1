var url = localStorage.getItem("url");

function getSectionName(sectionName) {

    var status = [];
    status["A"] = "Integra's Vision";
    status["B"] = "Policies";
    status["C"] = "Leadership";
    status["D"] = "Internal Communication";
    status["E"] = "HR Management";
    status["F"] = "Quality System";
    status["G"] = "Facilities and Infrastructure";
    status["H"] = "Training";
    status["I"] = "Accounts";
    status["J"] = "Professional Satifaction";
    status["K"] = "General Satisfaction";
    status["L"] = "Overall Satisfaction Level";

    return status[sectionName];
}

// To view the HTML/PDF content in a div
function displayObjContent(url) {
    alert("test" + url);
    $obj = $('<object>');
    $obj.attr("data", url);
    $obj.css("width", "100%");
    $obj.css("overflow", "scroll");
    $('#modal-default').attr("class", "modal fade in");
    $('#modal-default').css("display", "block");
    $('#modal-default').css("width", "100%");
    $('#objhtmlpdfDtl').append($obj);
    $('#objhtmlpdfDtl').css("width", "100%");
}

// For closing the HTML/PDF content div
function closeDisplayObjContent() {
    $('#modal-default').attr("class", "modal fade");
    $('#modal-default').css("display", "none");
}

function getListHoidays() {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    var year = "";
    if ($('#year').length) {
        year = document.getElementById("year").value;
    } else {
        var d = new Date();
        year = d.getFullYear();
    }
    $.ajax({
        type: "GET",
        url: url + "/holidayList/" + year,
        headers: {Authorization: session},
        success: function (data, textStatus) {
            console.log(data);
            if (data.status == 200) {
                // localStorage.setItem('session', data.data.Token);
                var holidayDtl = "";
                var count = 1;
                var result = data.data.Result;
                var holidayListArray = [];
                var finalHolidayList = [];
                var disDatesList = [];
                if (data.data.Result.length == 0) {
                    holidayDtl = "No Records Found";
                } else {
                    for (var i = 0; i < result.length; i++) {
                        var str = result[i].description;
                        if (holidayListArray.indexOf(str) == -1) {
                            holidayListArray.push(str);
                            finalHolidayList.push(result[i]);
                        }
                    }
                    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    $.each(finalHolidayList, function (k, v) {
                        var date = new Date(v.day);
                        var year = date.getFullYear();
                        var month = (date.getMonth()).toString();
                        var monthName = months[month];
                        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                        var day = date.getDate().toString();
                        day = day.length > 1 ? day : '0' + day;
                        var finalDate = day + "-" + monthName + "-" + year;

                        month = (date.getMonth() + 1).toString();

                        var mm = month.length > 1 ? month : '0' + month;

                        var disabledDates = mm + "/" + day + "/" + year;
                        disDatesList.push(moment(disabledDates));

                        holidayDtl += "<tr>";
                        holidayDtl += "<td>" + count + "</td>";
                        holidayDtl += "<td>" + v.description + "</td>";
                        holidayDtl += "<td>" + finalDate + "</td>";
                        count++;
                    });
                }
                console.log(JSON.stringify(disDatesList));
                localStorage.setItem("disDateDtl", JSON.stringify(disDatesList));
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
                holidayDtl = "No Records Found";
            } else {
                //localStorage.setItem('session', data.data.Token);
                holidayDtl = "No Records Found";
            }
            if ($('#holidayDtl').length) {
                document.getElementById("holidayDtl").innerHTML = holidayDtl;
            }
        }
    });
}

function getLeaveTypeStatus(statusType) {

    var status = [];
    status["approved"] = "label label-success";
    status["rejected"] = "label label-danger";
    status["cancel"] = "label label-warning";
    status["Pending"] = "label label-info";

    return status[statusType];
}

function validateMobile(inputtxt) {
    var phoneno = /^\d{10}$/;
    if ((inputtxt.value.match(phoneno))) {
        return true;
    } else {
        return false;
    }
}


function leaveHistoryOfEmp() {
    if (document.getElementById("leaveHistoryDtl") == null || document.getElementById("leaveHistoryDtl").childNodes.length == 3) {
        console.log("inside leave history fun");
        var session = localStorage.getItem("session");
        console.log("global " + session);
        console.log("scope " + session);
        $.ajax({
            type: "GET",
            url: url + "/leaveHistory",
            headers: {Authorization: session},
            success: function (data, textStatus) {
                console.log(data);
                var leaveHistoryDtl = "";
                var imsleaveHistoryDtl = "";
                if (data.status == 200) {
                    holiday();
                    if (data && data.data && data.data.Result) {
                        var badge = data.data.Result.length;
                        $.each(data.data.Result, function (k, v) {
                            var startdate = new Date(v.leave_start_date);
                            var year = startdate.getFullYear();
                            var month = (1 + startdate.getMonth()).toString();
                            month = month.length > 1 ? month : '0' + month;
                            var day = startdate.getDate().toString();
                            day = day.length > 1 ? day : '0' + day;
                            var startfinalDate = day + "-" + month + "-" + year;
                            var custstartfinalDate = year + "-" + month + "-" + day;
                            var stMonth = month;

                            var enddate = new Date(v.leave_end_date);
                            var year = enddate.getFullYear();
                            var month = (1 + enddate.getMonth()).toString();
                            month = month.length > 1 ? month : '0' + month;
                            var day = enddate.getDate().toString();
                            day = day.length > 1 ? day : '0' + day;
                            var endfinalDate = day + "-" + month + "-" + year;
                            var custendfinalDate = year + "-" + month + "-" + day;
                            var enMonth = month;

                            if (v.status == "Pending") {
                                //imsleaveHistoryDtl += '<div class="row leaveDtls" style="border:1px solid orange;"><div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Start Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + startfinalDate + '</label> </div> <div class="form-group"> <label for="inputName" class="control-label">Total Leaves</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.no_leaves + '</label> </div> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">End Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + endfinalDate + '</label> </div> </div> <div class="form-group"> <label for="inputName" class="control-label">Manager</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.approvedByName.trim() + '</label> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Leave Types</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.leaveTypeName + '</label> </div> </div>  <div class="form-group"> <label for="inputName" class="control-label"> Status</label> <div class="form-group" style="vertical-align: middle;"> <div> <button type="button" class="btn btn-primary btn-normal" data-toggle="modal" data-target="#modal-default" onclick="setUpdateLeave(\'' + v.req_no + '\',\'' + v.leave_type + '\',\'' + custstartfinalDate + '\',\'' + custendfinalDate + '\',\'' + v.phone_no + '\',\'' + v.reason + '\',\'' + v.contact_details + '\')" id="btnUpdate"><span class="fa fa-edit"></span></button> <button type="submit" class="btn btn-warning" onclick=cancelLeave(' + v.req_no + ') name="btnCancel" id="btnCancel"><span class="fa fa-times"></span></button> </div> </div> </div> </div></div>';
                                imsleaveHistoryDtl += '<tr style="border:1px solid #dad8d8"> <td style="border:1px solid #dad8d8;">' + startfinalDate + '</td> <td style=" border:1px solid #dad8d8;">' + endfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + v.no_leaves + '</td> <td style="border:1px solid #dad8d8;">' + v.leaveTypeName + '</td> <td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle">' + v.reason + '</td> <td style=" border: none;" style="vertical-align: middle"> <button type="button" style="padding:3px 6px" class="btn btn-primary" data-toggle="modal" data-target="#modal-default" onclick="setUpdateLeave(\'' + v.req_no + '\',\'' + v.leave_type + '\',\'' + custstartfinalDate + '\',\'' + custendfinalDate + '\',\'' + v.phone_no + '\',\'' + v.reason + '\',\'' + v.contact_details + '\')" id="btnUpdate"> <span class="fa fa-pencil fa-xs"></span> </button>&nbsp;<button type="button" style="padding:3px 6px" class="btn btn-warning" id="btnCancel" onclick=cancelLeave(' + v.req_no + ')> <span class="fa fa-xs fa-close"></span> </button></td> </tr>';
                            }
                            if (v.status == "approved") {
                                //imsleaveHistoryDtl += '<div class="row leaveDtls" style="border:1px solid green;"><div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Start Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + startfinalDate + '</label> </div> <div class="form-group"> <label for="inputName" class="control-label">Total Leaves</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.no_leaves + '</label> </div> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">End Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal" >' + endfinalDate + '</label> </div> </div> <div class="form-group"> <label for="inputName" class="control-label">Manager</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.approvedByName.trim() + '</label> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Leave Types</label> <div class="input-group"> <label for="inputName"  style="font-weight:normal">' + v.leaveTypeName + '</label> </div> </div>  <div class="form-group"> <label for="inputName" class="control-label"> Status</label> <div class="input-group"> <label for="inputName" style="font-weight:normal"> ' + v.status + ' </label> </div> </div> </div></div>';
                                imsleaveHistoryDtl += '<tr style="border:1px solid #dad8d8"> <td style="border:1px solid #dad8d8;">' + startfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + endfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + v.no_leaves + '</td> <td style="border:1px solid #dad8d8;">' + v.leaveTypeName + '</td> <td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle"> ' + v.reason + '</td> <td style="vertical-align: middle;border: none; "><span class="label label-success ">Approved</span></td> </tr>';
                            }
                            if (v.status == "rejected") {
                                //imsleaveHistoryDtl += '<div class="row leaveDtls" style="border:1px solid red;"><div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Start Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + startfinalDate + '</label> </div> <div class="form-group"> <label for="inputName" class="control-label">Total Leaves</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.no_leaves + '</label> </div> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">End Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal" >' + endfinalDate + '</label> </div> </div> <div class="form-group"> <label for="inputName" class="control-label">Manager</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.approvedByName.trim() + '</label> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Leave Types</label> <div class="input-group"> <label for="inputName"  style="font-weight:normal">' + v.leaveTypeName + '</label> </div> </div>  <div class="form-group"> <label for="inputName" class="control-label"> Status</label> <div class="input-group"> <label for="inputName" style="font-weight:normal"> ' + v.status + ' </label> </div> </div> </div></div>';
                                imsleaveHistoryDtl += '<tr style="border:1px solid #dad8d8"> <td style=" border:1px solid #dad8d8;">' + startfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + endfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + v.no_leaves + '</td> <td style="border:1px solid #dad8d8;">' + v.leaveTypeName + '</td> <td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle"> ' + v.reason + '</td> <td style="vertical-align: middle;border: none; "><span class="label label-danger ">Rejected</span></td> </tr>';
                            }
                            if (v.status == "cancel") {
                                //imsleaveHistoryDtl += '<div class="row leaveDtls" style="border:1px solid yellow;"><div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Start Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + startfinalDate + '</label> </div> <div class="form-group"> <label for="inputName" class="control-label">Total Leaves</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.no_leaves + '</label> </div> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">End Date</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + endfinalDate + '</label> </div> </div> <div class="form-group"> <label for="inputName" class="control-label">Manager</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.approvedByName.trim() + '</label> </div> </div> </div> <div class="col-lg-4 col-md-6 col-xs-6"> <div class="form-group"> <label for="inputName" class="control-label">Leave Types</label> <div class="input-group"> <label for="inputName" style="font-weight:normal">' + v.leaveTypeName + '</label> </div> </div>  <div class="form-group"> <label for="inputName" class="control-label"> Status</label> <div class="input-group"> <label for="inputName" style="font-weight:normal"> ' + v.status + ' </label> </div> </div> </div></div>';
                                imsleaveHistoryDtl += '<tr style="border:1px solid #dad8d8"> <td style="border:1px solid #dad8d8;">' + startfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + endfinalDate + '</td> <td style="border:1px solid #dad8d8;">' + v.no_leaves + '</td> <td style="border:1px solid #dad8d8;">' + v.leaveTypeName + '</td> <td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle"> ' + v.reason + '</td> <td style="vertical-align: middle;border: none; "><span class="label label-warning ">Cancelled</span></td> </tr>';
                            }

                            var chkDate = new Date();
                            var ckMonth = (1 + chkDate.getMonth()).toString();
                            ckMonth = ckMonth.length > 1 ? ckMonth : '0' + ckMonth;

                            //if (ckMonth == stMonth || ckMonth == enMonth) {
                            leaveHistoryDtl += "<tr>";
                            leaveHistoryDtl += "<td>" + v.req_no + "</td>";
                            leaveHistoryDtl += "<td>" + startfinalDate + "</td>";
                            leaveHistoryDtl += "<td>" + endfinalDate + "</td>";
                            leaveHistoryDtl += "<td>" + v.no_leaves + "</td>";
                            leaveHistoryDtl += "<td>" + v.leaveTypeName + "</td>";
                            leaveHistoryDtl += "<td>" + v.approvedByName.trim() + "</td>";
                            leaveHistoryDtl += "<td>" + v.reason + "</td>";
                            var statusValue = v.status;
                            if (statusValue == "cancel") {
                                statusValue = "Cancelled";
                            }
                            if (statusValue == "rejected") {
                                statusValue = "Rejected";
                            }
                            if (statusValue == "approved") {
                                statusValue = "Approved";
                            }
                            console.log("Status value is : " + statusValue);
                            leaveHistoryDtl += "<td> <span class='" + getLeaveTypeStatus(v.status) + "'>" + statusValue + "</span></td>";
                            //  }
                        });
                    }

                    if ($('#leaveHistoryDtl').length) {

                        if (leaveHistoryDtl == "") {
                            document.getElementById("imsleaveDtls").innerHTML = "<tr><td colspan='6'>No leave History data found</td></tr>";
                        } else {
                            document.getElementById("leaveHistoryDtl").innerHTML = leaveHistoryDtl;
                        }
                    }
                    if ($('#imsleaveDtls').length) {
                        if (imsleaveHistoryDtl == "") {
                            document.getElementById("imsleaveDtls").innerHTML = "<tr><td colspan='6'>No leave details found</td></tr>";
                            document.getElementById("leaveDtlsBadge").innerHTML = 0;
                        } else {
                            document.getElementById("imsleaveDtls").innerHTML = imsleaveHistoryDtl;
                            document.getElementById("leaveDtlsBadge").innerHTML = badge;
                        }
                    }
                    $('#example2').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": false,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false,
                        "pageLength": 4,
                        "bInfo": false
                    });

                } else if (data.status == 500) {
                    //localStorage.setItem('session', data.data.Token);
                } else if (data.status == 404) {
                    logout();
                }
            }
        });
    }

}

function LeaveHistoryOfEmpByDates() {
    console.log("inside leave history between dates fun");
    var session = localStorage.getItem("session");

    var startDate = $('#startDate').val();
    var endDate = $('#endDate').val();

    var validate = true;
    if (startDate == "") {
        $("#startDate").css("border-top-color", "red");
        $('#startDate').notify("Enter From Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#startDate").css("border-top-color", "#d2d6de");
    }
    if (endDate == "") {
        $("#endDate").css("border-top-color", "red");
        $('#endDate').notify("Enter To Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#endDate").css("border-top-color", "#d2d6de");
    }

    if (validate == false) {
        return;
    }

    var chkstdate = new Date(startDate);
    var chkendate = new Date(endDate);

    var flag = true;

    if (chkstdate.getTime() > chkendate.getTime()) {
        flag = false;
        $.notify("You cannot select less date than previous date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    }

    if (flag == false) {
        return;
    }

    $.ajax({
        type: "POST",
        url: url + "/leaveHistoryBetweenDates",
        headers: {Authorization: session},
        data: {startDate: startDate, endDate: endDate},
        success: function (data, textStatus) {
            console.log(data);
            var leaveHistoryDtl = "";
            if (data.status == 200) {
                // localStorage.setItem('session', data.data.Token);
                $.each(data.data.Result, function (k, v) {
                    var startdate = new Date(v.leave_start_date);
                    var year = startdate.getFullYear();
                    var month = (1 + startdate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = startdate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var startfinalDate = day + "-" + month + "-" + year;

                    var enddate = new Date(v.leave_end_date);
                    var year = enddate.getFullYear();
                    var month = (1 + enddate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = enddate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var endfinalDate = day + "-" + month + "-" + year;

                    var statusValue = v.status;
                    if (statusValue == "cancel") {
                        statusValue = "Cancelled";
                    }
                    if (statusValue == "rejected") {
                        statusValue = "Rejected";
                    }
                    if (statusValue == "approved") {
                        statusValue = "Approved";
                    }
                    console.log("Status value is : " + statusValue);

                    leaveHistoryDtl += "<tr>";
                    leaveHistoryDtl += "<td>" + v.req_no + "</td>";
                    leaveHistoryDtl += "<td>" + startfinalDate + "</td>";
                    leaveHistoryDtl += "<td>" + endfinalDate + "</td>";
                    leaveHistoryDtl += "<td>" + v.no_leaves + "</td>";
                    leaveHistoryDtl += "<td>" + v.leaveTypeName + "</td>";
                    leaveHistoryDtl += "<td>" + v.approvedByName.trim() + "</td>";
                    leaveHistoryDtl += "<td>" + v.reason + "</td>";
                    leaveHistoryDtl += "<td> <span class='" + getLeaveTypeStatus(v.status) + "'>" + statusValue + "</span></td>";
                });

                var len = document.getElementById("leaveHistoryDtl").childNodes.length;
                var list = document.getElementById("leaveHistoryDtl");
                for (var i = 0; i < len; i++) {
                    list.removeChild(list.childNodes[0]);
                }


                if ($.fn.dataTable.isDataTable('#example2')) {
                    console.log("222");
                    $('#example2').DataTable();
                } else {
                    console.log("333");
                    $('#example2').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false,
                        "pageLength": 4,
                        "bInfo": false
                    });
                }


                if ($('#leaveHistoryDtl').length) {
                        document.getElementById("leaveHistoryDtl").innerHTML = leaveHistoryDtl;
                }


            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            } else if (data.status == 404) {
                location.href = "/IMSWiki/login"
            } else {
                location.href = "/IMSWiki/login"
            }
        }
    });
}

function setUpdateLeave(reqNum, leaveType, startDate, endDate, phone, reason, address) {

    $('input:radio[name="r3"]').filter('[value=' + leaveType + ']').attr('checked', true);
    console.log(startDate);
    $('#startDate').val(startDate);
    $('#endDate').val(endDate);

    $('#txtPhone').val(phone);
    $('#txtReason').val(reason);
    $('#txtAddress').val(address);
    $('#reqNum').val(reqNum);
}

function employeeListFun() {
    console.log("inside employeeList fun");
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        type: "GET",
        url: url + "/empUnderReportingHead",
        headers: {Authorization: session},
        success: function (data, textStatus) {
            console.log(data);
            var employeeListDtl = "";

            if (data.status == 200) {
                // localStorage.setItem('session', data.data.Token);
                if (data.data.Result.length == 0) {
                    employeeListDtl = "No Records Found";
                } else {
                    $.each(data.data.Result, function (k, v) {
                        var joindate = new Date(v.join_date);
                        var year = joindate.getFullYear();
                        var month = (1 + joindate.getMonth()).toString();
                        month = month.length > 1 ? month : '0' + month;
                        var day = joindate.getDate().toString();
                        day = day.length > 1 ? day : '0' + day;
                        var joinfinalDate = day + "-" + month + "-" + year;
                        var empcode = v.emp_code;
                        employeeListDtl += "<tr>";
                        employeeListDtl += "<td>" + v.emp_code_entered + "</td>";
                        employeeListDtl += "<td>" + v.emp_name.trim() + "</td>";
                        employeeListDtl += "<td>" + joinfinalDate + "</td>";
                        employeeListDtl += "<td>" + v.designation.trim() + "</td>";
                        employeeListDtl += "<td style='text-align:center'><button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-empList' onclick='employeeLeaveDetailsFun(" + v.emp_code + ");'><span class='fa fa-history'></span> &nbsp; Leave History </button></td>";
                    });
                }
                document.getElementById("employeeListDtl").innerHTML = employeeListDtl;
                if ($.fn.dataTable.isDataTable('#example2')) {
                    $('#example2').DataTable();
                } else {
                    $('#example2').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": true,
                        "ordering": false,
                        "info": true,
                        "autoWidth": false,
                        "bInfo": false
                    });
                }
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function closeEmployeeListPopup() {
    $('#employeeLeaveDetailsId').attr("class", "modal fade");
    $('#employeeLeaveDetailsId').css("display", "none");
}

function employeeLeaveDetailsFun(empcode) {
    // $('#employeeLeaveDetailsId').attr("class", "modal fade in");
    // $('#employeeLeaveDetailsId').css("display", "block");
    //$('#employeeLeaveDetailsId').css("width", "100%");
    console.log("inside employeeList fun");
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);

    var allLeaveDtl = "";
    $.ajax({
        type: "GET",
        url: url + "/leaveHistory/" + empcode,
        headers: {Authorization: session},
        success: function (data, textStatus) {
            console.log(data);

            if (data.status == 200) {
                // localStorage.setItem('session', data.data.Token);
                $.each(data.data.Result, function (k, v) {
                    var startdate = new Date(v.leave_start_date);
                    var year = startdate.getFullYear();
                    var month = (1 + startdate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = startdate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var startfinalDate = day + "-" + month + "-" + year;

                    var enddate = new Date(v.leave_end_date);
                    var year = enddate.getFullYear();
                    var month = (1 + enddate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = enddate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var endfinalDate = day + "-" + month + "-" + year;

                    var statusValue = v.status;
                    if (statusValue == "cancel") {
                        statusValue = "Cancelled";
                    }
                    if (statusValue == "rejected") {
                        statusValue = "Rejected";
                    }
                    if (statusValue == "approved") {
                        statusValue = "Approved";
                    }
                    console.log("Status value is : " + statusValue);

                    allLeaveDtl += "<tr>";
                    allLeaveDtl += "<td>" + v.req_no + "</td>";
                    allLeaveDtl += "<td>" + startfinalDate + "</td>";
                    allLeaveDtl += "<td>" + endfinalDate + "</td>";
                    allLeaveDtl += "<td>" + v.no_leaves + "</td>";
                    allLeaveDtl += "<td>" + v.leaveTypeName + "</td>";
                    allLeaveDtl += "<td>" + v.reason + "</td>";
                    allLeaveDtl += "<td>" + v.approvedByName.trim() + "</td>";
                    allLeaveDtl += "<td> <span class='" + getLeaveTypeStatus(v.status) + "'>" + statusValue + "</span></td>";
                    allLeaveDtl += "</tr>";

                });
                document.getElementById("allLeaveDtl").innerHTML = allLeaveDtl;
                if ($.fn.dataTable.isDataTable('#tblLeaveHistory')) {
                    $('#tblLeaveHistory').DataTable();
                } else {
                    $('#tblLeaveHistory').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false
                    });
                }
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function submitLeave() {
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var phone = document.getElementById('txtPhone').value;
    var leaveType = $("input[name='r3']:checked").val();
    var reason = document.getElementById('txtReason').value;
    var address = document.getElementById('txtAddress').value;

    var validate = true;

    if (startDate == "") {
        $("#startDate").css("border-top-color", "red");
        $('#startDate').notify("Enter From Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#startDate").css("border-top-color", "#d2d6de");
    }
    if (endDate == "") {
        $("#endDate").css("border-top-color", "red");
        $('#endDate').notify("Enter To Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#endDate").css("border-top-color", "#d2d6de");
    }
    if (phone == "") {
        $("#txtPhone").css("border-top-color", "red");
        $('#txtPhone').notify("Enter Mobile Number", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        var cmpMobileRegex = /^\d{10}$/;
        if (!phone.match(cmpMobileRegex)) {
            $("#txtPhone").css("border-top-color", "red");
            $('#txtPhone').notify("Mobile Number should be 10 digits", 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            validate = false;
        } else {
            $("#txtPhone").css("border-top-color", "#d2d6de");
        }
    }
    if (leaveType == "") {
        $("#leaveType").css("border-top-color", "red");
        $('#leaveType').notify("Select Leave Type", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#leaveType").css("border-top-color", "#d2d6de");
    }
    if (reason == "") {
        $("#txtReason").css("border-top-color", "red");
        $('#txtReason').notify("Enter Reason", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        var reasonRegex = /^.*[A-Za-z]+[0-9]*[\n.]*$/;
        if (!reason.match(reasonRegex)) {
            $("#txtReason").css("border-top-color", "red");
            $('#txtReason').notify("Please enter a valid reason (speial characters are not allowed)", 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            validate = false;
        } else {
            $("#txtReason").css("border-top-color", "#d2d6de");
        }
    }
    if (address == "") {
        $("#txtAddress").css("border-top-color", "red");
        $('#txtAddress').notify("Enter Address", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#txtAddress").css("border-top-color", "#d2d6de");
    }

    if (validate == false) {
        return;
    }

    console.log("inside employeeList fun");
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);

    console.log("startDate typeof submitLeave : " + startDate);
    console.log("endDate typeof submitLeave : " + endDate);

    var noOfLeaves = calculateDays(new Date(startDate), new Date(endDate));

    var flag = true;

    var chkstdate = new Date(startDate);
    var chkendate = new Date(endDate);

    console.log("chekstdate : " + chkstdate);
    console.log("chkendate : " + chkendate);

    if (chkstdate.getTime() > chkendate.getTime()) {
        flag = false;
        $.notify("You cannot select less date than previous date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    }

    if (noOfLeaves > 3 && leaveType == 1) {
        flag = false;
        $.notify("You cannot apply more than 3 Casual Leave", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    } else if (noOfLeaves < 4 && leaveType == 4) {
        flag = false;
        $.notify("You cannot apply less than 4 Privileged Leave", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    }

    var chkDate = new Date();
    var ckMonth = (1 + chkDate.getMonth()).toString();
    ckMonth = ckMonth.length > 1 ? ckMonth : '0' + ckMonth;
    var ckDay = (1 + chkDate.getDay()).toString();
    ckDay = ckDay.length > 1 ? ckDay : '0' + ckDay;
    var ckYear = chkDate.getFullYear();
    var customDate = ckYear + "-" + ckMonth + "-" + ckDay;

    if (flag == true) {
        $.ajax({
            type: "POST",
            url: url + "/requestLeave",
            headers: {Authorization: session},
            data: {
                startDate: startDate,
                endDate: endDate,
                leaveType: leaveType,
                reason: reason,
                address: address,
                phone: phone,
                noOfLeaves: noOfLeaves
            },
            dataType: "json",
            success: function (data, textStatus) {
                console.log("################--->" + data);
                if (data.status == 200) {
                    $.notify("Leave Submitted Successfully !", 'info', {
                        autoHide: true,
                        autoHideDelay: 5000,
                        clickToHide: true
                    });
                    localStorage.setItem('session', data.data.Token);
                    console.log(data.status);
                    leaveBalofEmp();
                } else {
                    if (data.status == 500) {
                        //localStorage.setItem('session', data.data.Token);
                        $.notify("Leave Already Exists !", 'error', {
                            autoHide: true,
                            autoHideDelay: 5000,
                            clickToHide: true
                        });
                    }
                }

                document.getElementById('startDate').value = customDate;
                document.getElementById('endDate').value = customDate;
                document.getElementById('txtPhone').value = "";
                $('input:radio[name="r3"]').filter('[value=1]').attr('checked', true);
                document.getElementById('txtReason').value = "";
                document.getElementById('txtAddress').value = "";
            }
        });
    }
    document.getElementById('startDate').value = customDate;
    document.getElementById('endDate').value = customDate;
    document.getElementById('txtPhone').value = "";
    $('input:radio[name="r3"]').filter('[value=1]').attr('checked', true);
    document.getElementById('txtReason').value = "";
    document.getElementById('txtAddress').value = "";
}

function clearLeave() {

    var chkDate = new Date();
    var ckMonth = (1 + chkDate.getMonth()).toString();
    ckMonth = ckMonth.length > 1 ? ckMonth : '0' + ckMonth;
    var ckDay = (1 + chkDate.getDay()).toString();
    ckDay = ckDay.length > 1 ? ckDay : '0' + ckDay;
    var ckYear = chkDate.getFullYear();
    var customDate = ckYear + "-" + ckMonth + "-" + ckDay;

    document.getElementById('startDate').value = customDate;
    document.getElementById('endDate').value = customDate;
    document.getElementById('txtPhone').value = "";
    $('input:radio[name="r3"]').filter('[value=1]').attr('checked', true);
    document.getElementById('txtReason').value = "";
    document.getElementById('txtAddress').value = "";

    $("#startDate").css("border-top-color", "#d2d6de");
    $("#endDate").css("border-top-color", "#d2d6de");
    $("#txtPhone").css("border-top-color", "#d2d6de");
    $("#leaveType").css("border-top-color", "#d2d6de");
    $("#txtReason").css("border-top-color", "#d2d6de");
    $("#txtAddress").css("border-top-color", "#d2d6de");
}

function holiday() {
    var date = new Date();
    var ye = date.getFullYear();
    console.log("Year : :" + ye);
    var holidayList3 = [];
    console.log("inside holidayMethod fun");
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        url: url + '/holidayList/' + ye,
        type: "get",
        headers: {Authorization: session},
        success: function (data) {
            if (data.status == 200) {
                // localStorage.setItem('session', data.Token);
                $.each(data.data.Result, function (k, v) {
                    var startDate = new Date(v.day);
                    var dateT = startDate.getDate();
                    var month = startDate.getMonth() + 1;
                    if (dateT < 10) {
                        dateT = '0' + dateT;
                    }
                    if (month < 10) {
                        month = '0' + month;
                    }
                    var start = startDate.getFullYear() + '-' + month + '-' + dateT;
                    holidayList3.push(v.day.substring(0, 10));
                })
                localStorage.setItem("holidays3", JSON.stringify(holidayList3));
            } else if (data.status == 500) {

            }
        }
    })
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function calculateDays(first, last) {
    var holi = JSON.parse(localStorage.getItem("holidays3"));
    var gon = {};
    console.log("in calc days : " + holi);
    gon["holiday"] = holi;
    var aDay = 24 * 60 * 60 * 1000,
        daysDiff = parseInt((last.getTime() - first.getTime()) / aDay, 10) + 1;
    if (daysDiff > 0) {
        for (var i = first.getTime(), lst = last.getTime(); i <= lst; i = i + aDay) {
            var d = new Date(i);
            if (d.getDay() == 6 || d.getDay() == 0 || gon.holiday.indexOf(formatDate(d)) != -1) {
                daysDiff--;
            }
        }
    }
    console.log("Days differ : " + daysDiff);
    return daysDiff;
}

// function leaveBalofEmp() {
//     console.log("calling leave bal of emp...");
//     var d = new Date();
//     var year = d.getFullYear();
//     console.log("inside leaveBalofEmp fun" + year);
//     var session = localStorage.getItem("session");
//     console.log("global " + session);
//     console.log("scope " + session);
//     $.ajax({
//         type: "POST",
//         url: url + "/leaveBalanceOfEmployee",
//         headers: {Authorization: session},
//         data: {year: year},
//         dataType: "json",
//         success: function (data, textStatus) {
//             console.log(data);
//             console.log("status : " + data.status);
//             if (data.status == 200) {
//                 // localStorage.setItem('session', data.data.Token);
//                 if (data.data.Result == undefined) {
//                     console.log("no records found");
//                     localStorage.setItem("pl", 0);
//                     localStorage.setItem("cl", 0);
//                 } else {
//                     var pl = data.data.Result.plLeft;
//                     var cl = data.data.Result.clLeft;
//                     localStorage.setItem("pl", pl);
//                     localStorage.setItem("cl", cl);
//                 }
//             } else if (data.status == 500) {
//                 //localStorage.setItem('session', data.data.Token);
//             }
//         }
//     });
// }

function getEmpContactDetails(){
    var session = localStorage.getItem("session");

    $.ajax({
        type: "GET",
        url: url + "/getEmpContactDetails",
        headers: {Authorization: session},
        success: function (data, textStatus) {
            var contactDtl = "";

            if (data.status == 200) {
                $.each(data.data.Result, function (k, v) {
                    var d = new Date(v.date_of_birth);
                    var month = (d.getMonth() + 1).toString();
                    var dayemp = (d.getDate()).toString();
                    var ddemp = dayemp.length > 1 ? dayemp : '0' + dayemp;
                    var mmemp = month.length > 1 ? month : '0' + month;

                    contactDtl += "<tr>";
                    contactDtl += "<td>" + v.emp_code_entered + "</td>";
                    contactDtl += "<td>" + ddemp + "/" + mmemp + "/" + d.getFullYear()  + "</td>";
                    contactDtl += "<td>" + v.mobile + "</td>";
                    contactDtl += "<td>" + v.blood_group + "</td>";
                    contactDtl += "<td>" + v.imss_email + "</td>";
                    contactDtl += "<td>" + v.company + "</td>";
                });

                if ($('#contactDtl').length) {
                    if (contactDtl == "") {
                        document.getElementById('contactDtl').innerHTML = "<tr><td colspan='6'>No contact details available</td></tr>";
                    } else {
                        document.getElementById('contactDtl').innerHTML = contactDtl;
                    }
                }

                if ($.fn.dataTable.isDataTable('#example2')) {
                    $('#example3').DataTable();
                } else {
                    $('#example3').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false,
                        "pageLength": 10,
                        "bInfo": false
                    });
                }

            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}


function maDashboardFun() {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        type: "POST",
        url: url + "/leavesToApprove",
        headers: {Authorization: session},
        dataType: "json",
        success: function (data, textStatus) {
            console.log("status : " + data.status);
            var maDashboardDtl = "";
            var tbodyLeaveApproval = "";
            var badge = "";
            if (data.status == 200) {
                $.each(data.data.Result, function (k, v) {
                    badge = data.data.Result.length;
                    var startdate = new Date(v.leave_start_date);
                    var year = startdate.getFullYear();
                    var month = (1 + startdate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = startdate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var startfinalDate = day + "-" + month + "-" + year;

                    var enddate = new Date(v.leave_end_date);
                    var year = enddate.getFullYear();
                    var month = (1 + enddate.getMonth()).toString();
                    month = month.length > 1 ? month : '0' + month;
                    var day = enddate.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    var endfinalDate = day + "-" + month + "-" + year;

                    maDashboardDtl += "<tr>";
                    maDashboardDtl += "<td>" + v.req_no + "</td>";
                    maDashboardDtl += "<td>" + v.empName + "[" + v.empId + "]" + "</td>";
                    maDashboardDtl += "<td>" + startfinalDate + "</td>";
                    maDashboardDtl += "<td>" + endfinalDate + "</td>";
                    maDashboardDtl += '<td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle">' + v.reason.trim() + '</td>';
                    maDashboardDtl += "<td align='center'><button type='button' class='btn btn-primary btn-normal' onclick=approveLeave(" + v.req_no + ")><span class='fa fa-check'></span></button></td>";
                    maDashboardDtl += "<td align='center'><button type='button' class='btn btn-warning' onclick=rejectLeave(" + v.req_no + ")><span class='fa fa-times'></span></button></td>";

                    tbodyLeaveApproval += '<tr style="border:1px solid #dad8d8"> <td style=" border: none;">' + v.req_no + '</td> <td style=" border: none;">' + v.empName + '</td> <td style=" border: none;">' + startfinalDate + '</td> <td style=" border: none;">' + endfinalDate + '</td> <td class="tbl" style="border:1px solid #dad8d8;max-width: 106px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: block;font-weight: bold;" style="vertical-align: middle">' + v.reason + '</td> <td style=" border: none;" style="vertical-align: middle"> <button type="button" style="padding:3px 6px" class="btn btn-primary" onclick=approveLeave(' + v.req_no + ')> <span class="fa fa-check fa-xs"></span> </button>&nbsp;<button type="button" style="padding:3px 6px" class="btn btn-warning" id="btnCancel" onclick=rejectLeave(' + v.req_no + ')> <span class="fa fa-xs fa-close"></span> </button></td> </tr>';

                });

                if ($('#maDashboardDtl').length) {
                    if (maDashboardDtl == "") {
                        document.getElementById('maDashboardDtl').innerHTML = "<tr><td colspan='6'>No leave requests available</td></tr>";
                    } else {
                        document.getElementById('maDashboardDtl').innerHTML = maDashboardDtl;
                    }
                }

                if ($('#tbodyLeaveApproval').length) {
                    if (tbodyLeaveApproval == "") {
                        document.getElementById('tbodyLeaveApproval').innerHTML = "<tr><td colspan='6'>No requests for leave approvals</td></tr>";
                        document.getElementById('leaveApproveBadgeDtl').innerHTML = 0;
                    } else {
                        document.getElementById('tbodyLeaveApproval').innerHTML = tbodyLeaveApproval;
                        document.getElementById('leaveApproveBadgeDtl').innerHTML = badge;
                    }
                }

                if ($.fn.dataTable.isDataTable('#example2')) {
                    $('#example2').DataTable();
                } else {
                    $('#example2').DataTable({
                        "paging": true,
                        "lengthChange": false,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false,
                        "pageLength": 4,
                        "bInfo": false
                    });
                }
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function rejectLeave(leaveReqNumber) {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        type: "POST",
        url: url + "/rejectLeave",
        headers: {Authorization: session},
        data: {reqNum: leaveReqNumber, comments: "Rejected"},
        dataType: "json",
        success: function (data, textStatus) {
            if (data.status == 200) {
                //localStorage.setItem('session', data.data.Token);
                $.notify("Leave Rejected Successfully", 'info', {
                    autoHide: true,
                    autoHideDelay: 5000,
                    clickToHide: true
                });
                maDashboardFun();
                leaveBalofEmp();
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function approveLeave(leaveReqNumber) {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        type: "POST",
        url: url + "/approveLeave",
        headers: {Authorization: session},
        data: {reqNum: leaveReqNumber, comments: "Approved"},
        dataType: "json",
        success: function (data, textStatus) {
            if (data.status == 200) {
                //  localStorage.setItem('session', data.data.Token);
                $.notify("Leave Approved Successfully", 'info', {
                    autoHide: true,
                    autoHideDelay: 5000,
                    clickToHide: true
                });
                maDashboardFun();
                leaveBalofEmp();
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function cancelLeave(leaveReqNumber) {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    $.ajax({
        type: "POST",
        url: url + "/cancelLeave",
        headers: {Authorization: session},
        data: {reqNum: leaveReqNumber},
        dataType: "json",
        success: function (data, textStatus) {
            if (data.status == 200) {
                // localStorage.setItem('session', data.data.Token);
                $.notify("Leave Cancelled Successfully", 'info', {
                    autoHide: true,
                    autoHideDelay: 5000,
                    clickToHide: true
                });
                leaveHistoryOfEmp();
                leaveBalofEmp();
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
            }
        }
    });
}

function updateLeave() {
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var phone = document.getElementById('txtPhone').value;
    var leaveType = $("input[name='r3']:checked").val();
    var reason = document.getElementById('txtReason').value;
    var address = document.getElementById('txtAddress').value;
    var reqNum = document.getElementById('reqNum').value;

    var validate = true;

    if (startDate == "") {
        $("#startDate").css("border-top-color", "red");
        $('#startDate').notify("Enter From Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#startDate").css("border-top-color", "#d2d6de");
    }
    if (endDate == "") {
        $("#endDate").css("border-top-color", "red");
        $('#endDate').notify("Enter To Date", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#endDate").css("border-top-color", "#d2d6de");
    }
    if (phone == "") {
        $("#txtPhone").css("border-top-color", "red");
        $('#txtPhone').notify("Enter Mobile Number", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        var cmpMobileRegex = /^\d{10}$/;
        if (!phone.match(cmpMobileRegex)) {
            $("#txtPhone").css("border-top-color", "red");
            $('#txtPhone').notify("Mobile Number should be 10 digits", 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            validate = false;
        } else {
            $("#txtPhone").css("border-top-color", "#d2d6de");
        }
    }
    if (leaveType == "") {
        $("#leaveType").css("border-top-color", "red");
        $('#leaveType').notify("Select Leave Type", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#leaveType").css("border-top-color", "#d2d6de");
    }
    if (reason == "") {
        $("#txtReason").css("border-top-color", "red");
        $('#txtReason').notify("Enter Reason", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        var reasonRegex = /^.*[A-Za-z]+[0-9]*[\n.]*$/;
        if (!reason.match(reasonRegex)) {
            $("#txtReason").css("border-top-color", "red");
            $('#txtReason').notify("Please enter a valid reason (speial characters are not allowed)", 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            validate = false;
        } else {
            $("#txtReason").css("border-top-color", "#d2d6de");
        }
    }
    if (address == "") {
        $("#txtAddress").css("border-top-color", "red");
        $('#txtAddress').notify("Enter Address", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = false;
    } else {
        $("#txtAddress").css("border-top-color", "#d2d6de");
    }

    if (validate == false) {
        return;
    }

    console.log("inside updateLeave fun");
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);

    console.log("startDate : in updateLeave " + startDate);
    console.log("endDate : in updateLeave" + endDate);
    var noOfLeaves = calculateDays(new Date(startDate), new Date(endDate));

    var flag = true;
    if (noOfLeaves > 3 && leaveType == 1) {
        flag = false;
        $.notify("You cannot apply more than 3 Casual Leave", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    } else if (noOfLeaves < 4 && leaveType == 4) {
        flag = false;
        $.notify("You cannot apply less than 4 Privileged Leave", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    }

    if (flag == true) {
        $.ajax({
            type: "POST",
            url: url + "/updateLeave",
            headers: {Authorization: session},
            data: {
                reqNum: reqNum,
                startDate: startDate,
                endDate: endDate,
                leaveType: leaveType,
                reason: reason,
                address: address,
                phone: phone,
                noOfLeaves: noOfLeaves
            },
            dataType: "json",
            success: function (data, textStatus) {
                console.log("################ inside post--->" + data.status);
                if (data.status == 200) {
                    //  localStorage.setItem('session', data.data.Token);
                    console.log(data.status);
                    $.notify("Leave Updated Successfully", 'info', {
                        autoHide: true,
                        autoHideDelay: 5000,
                        clickToHide: true
                    });
                    leaveHistoryOfEmp();
                    leaveBalofEmp();
                    $('#modal-default').modal('hide');
                } else if (data.status == 500) {
                    //localStorage.setItem('session', data.data.Token);
                    $.notify("Leave Already Applied", 'info', {
                        autoHide: true,
                        autoHideDelay: 5000,
                        clickToHide: true
                    });
                } else {
                    $('#modal-default').modal('hide');
                    //localStorage.setItem('session', data.data.Token);
                }
            }
        });
    }
}

function defaultSelectYearInHoliList() {
    var year = document.getElementById('year');
    var date = new Date();
    var ye = date.getFullYear();
    var prevye = ye - 1;
    var yearDtl = "<option>Select Year</option>";
    yearDtl += "<option>" + prevye + "</option>";
    yearDtl += "<option selected>" + ye + "</option>";
    year.innerHTML = yearDtl;
}

function logout() {
    localStorage.clear();
    location.href = "/IMSWiki/login";
}

function leaveBalofEmp() {
    console.log("calling leave bal of emp...");
    var d = new Date();
    var year = d.getFullYear();
    console.log("inside leaveBalofEmp fun" + year);
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    if (localStorage.getItem("pl") == null && localStorage.getItem("cl") == null) {
        $.ajax({
            type: "POST",
            url: url + "/leaveBalanceOfEmployee",
            headers: {Authorization: session},
            data: {year: year},
            dataType: "json",
            success: function (data, textStatus) {
                console.log(data);
                console.log("status : " + data.status);
                if (data.status == 200) {
                    // localStorage.setItem('session', data.data.Token);
                    if (data.data.Result == undefined) {
                        console.log("no records found");
                        localStorage.setItem("pl", 0);
                        localStorage.setItem("cl", 0);
                        document.getElementById('casualLeaveDtl').innerHTML = localStorage.getItem('cl');
                        document.getElementById('privilegedLeaveDtl').innerHTML = localStorage.getItem('pl');
                    } else {
                        var pl = data.data.Result.plLeft;
                        var cl = data.data.Result.clLeft;
                        localStorage.setItem("pl", pl);
                        localStorage.setItem("cl", cl);
                        document.getElementById('casualLeaveDtl').innerHTML = localStorage.getItem('cl');
                        document.getElementById('privilegedLeaveDtl').innerHTML = localStorage.getItem('pl');
                    }
                } else if (data.status == 500) {
                    //localStorage.setItem('session', data.data.Token);
                }
            }
        });
    } else {
        if ($('#casualLeaveDtl').length) {
            document.getElementById('casualLeaveDtl').innerHTML = localStorage.getItem('cl');
        }
        if ($('#privilegedLeaveDtl').length) {
            document.getElementById('privilegedLeaveDtl').innerHTML = localStorage.getItem('pl');
        }
    }
}

function getInAppNotifications() {
    var session = localStorage.getItem("session");
    console.log("global " + session);
    console.log("scope " + session);
    var userData = JSON.parse(localStorage.getItem('userDetails'));
    var img = "/images/profile/" + userData.empId + ".JPG";
    //if (localStorage.getItem("inAppNotiListDtl") == null) {
    $.ajax({
        type: "GET",
        url: url + "/getInAppNoti",
        headers: {Authorization: session},
        success: function (data, textStatus) {
            console.log(data);
            var inAppNotiListDtl = "";
            var allInAppNotiDtl = "";
            var test1 = "";
            if (data.status == 200) {
                //localStorage.setItem('session', data.data.Token);
                if (data.data.Result.length == 0) {
                    allInAppNotiDtl = "No Records Found";
                } else {
                    $.each(data.data.Result, function (k, v) {
                        //debugger;
                        var customStyle = "";
                        if (v.from != undefined) {
                            img = "/images/profile/" + v.from + ".JPG";
                        }
                        if (v.system == false) {
                            //allInAppNotiDtl += '<div class="box-comment"><img class="direct-chat-img" src="' + img + '" onerror="this.src=\'/images/profile/default.png\'" alt="IMSS"><div class="comment-text"> <span class="username">' + 'IMSS' + '<span class="text-muted pull-right">' + moment(v.createdOn, "YYYY-MM-DDThh:mm:ss.SSSZ").fromNow() + '</span> </span><p class="message">' + v.message + '</p></div> </div>';
                        } else {
                            //allInAppNotiDtl += '<div class="box-comment"><img class="direct-chat-img" src="' + img + '" onerror="this.src=\'/images/profile/default.png\'" alt="IMSS"><div class="comment-text"> <span class="username">' + 'IMSS' + '<span class="text-muted pull-right"> <button type="button" data-toggle="modal" data-target="#modal-inapp" onclick="setInappData(\'' + v.message + '\')" class="btn btn-primary btn-normal"><span class="fa fa-eye"></span></button>' + moment(v.createdOn, "YYYY-MM-DDThh:mm:ss.SSSZ").fromNow() + '</span> </span><p class="message">' + v.message + '</p></div> </div>';
                        }
                        allInAppNotiDtl += '<div class="box-comment"><img class="direct-chat-img" src="' + img + '" onerror="this.src=\'/images/profile/default.png\'" alt="IMSS"><div class="comment-text"> <span class="username">' + 'IMSS' + '<span class="text-muted pull-right">' + moment(v.createdOn, "YYYY-MM-DDThh:mm:ss.SSSZ").fromNow() + '</span> </span><p class="message">' + v.message + '</p></div> </div>';
                    });
                    allInAppNotiDtl = replaceAll(allInAppNotiDtl, "<p>", "<p class='message'>");
                    localStorage.setItem("inAppNotiListDtl", allInAppNotiDtl);
                    document.getElementById("allInAppNotiDtl").innerHTML = localStorage.getItem("inAppNotiListDtl");
                }
            } else if (data.status == 500) {
                //localStorage.setItem('session', data.data.Token);
                holidayDtl = "No Records Found";
            } else {
                //localStorage.setItem('session', data.data.Token);
                holidayDtl = "No Records Found";
            }
        }
    });
    // } else {
    //     document.getElementById("allInAppNotiDtl").innerHTML = localStorage.getItem("inAppNotiListDtl");
    // }
    $(".message").shorten();
}


function checkImageExists(obj, callBack) {

    var imgs = [];
    //using promises
    var dfd = $.Deferred().resolve();
    obj.forEach(function (currentObj, index) {
        dfd = dfd.then(function () {
            var imageUrl = "/images/profile/" + currentObj.emp_code + ".JPG";
            $.ajax({
                url: url + imageUrl,
                type: 'GET',
                error: function () {
                    imgs.push("/images/profile/default.png");
                    return dfd.promise();
                },
                success: function (data) {
                    if (data.status == 404) {
                        imgs.push("/images/profile/default.png");
                        console.log("image not found");
                        if (index == obj.length - 1) {
                            callBack(imgs);
                        }
                    } else {
                        imgs.push(imageUrl);
                        console.log("image found");
                        if (index == obj.length - 1) {
                            callBack(imgs);
                        }
                    }
                }
            });
        });
    });
}

function showBirthdayWishes() {
    var wishesList = [];
    var carousels = [];

    var dob = JSON.parse(localStorage.getItem('DOB'));
    if (dob.length) {
        checkImageExists(dob, function (image) {

            if (image.length) {
                $.each(dob, function (index, currentObj) {
                    var activeItem = index == 0 ? 'class="item active"' : "class=item";
                    var cItem = index == 0 ? 'class="active"' : "class=";

                    var c = "<li data-target='#myCarousel1' data-slide-to=" + index + " class=" + cItem + "></li>";
                    carousels[index] = c;

                    var birthdayWishes = "<div " + activeItem + ">";
                    birthdayWishes += "<div class='card' style='width: 100%; '>";
                    birthdayWishes += "<div class='col-xs-12 card-block'>";
                    birthdayWishes += "<h3 style='text-align:center;font-weight: 500;color:#f1caca;font-family:cursive;' class='card-title'> Happy Birthday  <i class='fa fa-birthday-cake'></i></h3>";
                    birthdayWishes += "<div class='row'>";
                    birthdayWishes += "<div class='col-xs-4 pull-left'>";
                    birthdayWishes += "<img src=" + image[index] + " style='border-radius: 5px 5px 5px 5px;height:90px;width:80px;'></div>";
                    birthdayWishes += "<div class='col-xs-8 pull-right' style='margin-top:10px'>";
                    birthdayWishes += "<p class='card-text' style='font-size:15px; font-family:cursive;'>" + currentObj.fullName + "</p>";
                    birthdayWishes += "<p class='card-text' style='font-size:13px; font-weight:normal;font-family:cursive;'>";
                    birthdayWishes += "" + currentObj.designation + "</p>";
                    birthdayWishes += "<p class='card-text' style='font-size:13px; font-weight:normal; font-family:cursive;'>" + currentObj.imss_email.trim() + "</p></div></div></div></div></div>";
                    wishesList[index] = birthdayWishes;

                    if (index == dob.length - 1) {
                        carousels.length > 0 ? carousels.join('') : "";
                        document.getElementById('birthdayCard').innerHTML = wishesList;
                        document.getElementById('carousel').innerHTML = carousels;
                    }
                });
            }
        });
    } else {
        //send empty card
        //document.getElementById('birthdayCard').innerHTML = "<img src="+url+"/images/NoBirthday.jpg style=height: 100%">"
        //document.getElementById('birthdayCard').innerHTML = "<img src="+url+"/images/NoBirthday.jpg style='height: 100%'>"
        // document.getElementById("myCarousel1").style.display = "none";
        document.getElementById("birthday").style.display = "none";
    }
}

function onlyNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        $("#txtPhone").notify("Please enter numeric value", 'error', {
            autoHide: true,
            autoHideDelay: 1000,
            clickToHide: true
        });
        $("#txtPhone").css("border-color", "red");
        return false;
    } else {
        $("#txtPhone").css("border-color", "#d2d6de");
    }
    return true;
}

function setInappData(message) {
    $('#modalInappDtl').html(message);
}

function replaceAll(input, replace, replacewith) {
    return input.replace(new RegExp(replace, 'g'), replacewith);
}

function radioClear() {
    //$('input[name="r3"]').prop('checked', false);
    $('input[name="r3"]').filter('[value=1]').prop('checked', true);
}

function btnSubmit(idVal) {
    btnNext(idVal);
    var attitude = $("#attitudeDtl").val();
    var comments1 = $("#satisfyDtl").val();
    var comments2 = $("#leastSatisfyDtl").val();
    var comments3 = $("#contributeDtl").val();
    var comments4 = $("#suggestionDtl").val();
    var flagChk = false;

    if (attitude == "Select One") {
        $("#attitudeDtl").css("border-color", "red");
        $("#attitudeDtl").notify("Select Option", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        flagChk = true;
    } else {
        $("#attitudeDtl").css("border-color", "#d2d6de");
    }

    if (comments1 == "") {
        $("#satisfyDtl").css("border-color", "red");
        $("#satisfyDtl").notify("Enter Description", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        flagChk = true;
    } else {
        var reasonRegex = /^[^-\s][a-zA-Z0-9_\s-]+$/;
        if (!(comments1).match(reasonRegex)) {
            $('#satisfyDtl').notify('Special characters are not allowed', 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            flagChk = true;
        } else {
            $("#satisfyDtl").css("border-color", "#d2d6de");
        }
    }

    if (comments2 == "") {
        $("#leastSatisfyDtl").css("border-color", "red");
        $("#leastSatisfyDtl").notify("Enter Description", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        flagChk = true;
    } else {
        var reasonRegex = /^[^-\s][a-zA-Z0-9_\s-]+$/;
        if (!(comments2).match(reasonRegex)) {
            $('#leastSatisfyDtl').notify('Special characters are not allowed', 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            flagChk = true;
        } else {
            $("#leastSatisfyDtl").css("border-color", "#d2d6de");
        }
    }

    if (comments3 == "") {
        $("#contributeDtl").css("border-color", "red");
        $("#contributeDtl").notify("Enter Description", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        flagChk = true;
    } else {
        var reasonRegex = /^[^-\s][a-zA-Z0-9_\s-]+$/;
        if (!(comments3).match(reasonRegex)) {
            $('#contributeDtl').notify('Special characters are not allowed', 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            flagChk = true;
        } else {
            $("#contributeDtl").css("border-color", "#d2d6de");
        }
    }

    if (comments4 == "") {
        $("#suggestionDtl").css("border-color", "red");
        $("#suggestionDtl").notify("Enter Description", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        flagChk = true;
    } else {
        var reasonRegex = /^[^-\s][a-zA-Z0-9_\s-]+$/;
        if (!(comments4).match(reasonRegex)) {
            $('#suggestionDtl').notify('Special characters are not allowed', 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            flagChk = true;
        } else {
            $("#suggestionDtl").css("border-color", "#d2d6de");
        }
    }

    if (flagChk == false) {
        var finalArr = localStorage.getItem("ess").split(",");
        console.log("submit array :::");
        if (finalArr[0] != "null") {
            console.log(finalArr);
            var submitArray = [];
            for (var i = 0; i < finalArr.length; i++) {
                var quesCode = finalArr[i];
                console.log("QuestCode ::: " + quesCode);
                var imp = $("#i" + finalArr[i]).val();
                var ratting = $("#r" + finalArr[i]).val();
                var json = {
                    "que_code": quesCode,
                    "rating": parseInt(ratting),
                    "important": imp
                }
                submitArray.push(json);
            }
            console.log("Final Submit array ::: ");
            console.log(submitArray);
            var finalJsonDtl = {
                survey: JSON.stringify(submitArray),
                attitude: attitude,
                comments1: comments1,
                comments2: comments2,
                comments3: comments3,
                comments4: comments4
            };

            console.log(finalJsonDtl);
            $.ajax({
                url: url + "/submitSurvey",
                type: "POST",
                headers: {Authorization: session},
                data: finalJsonDtl,
                dataType: "json",
                success: function (data, textStatus) {
                    console.log(data);
                    if (data.status == 200) {
                        console.log(data.data.Result);
                        if (data.data.Result != undefined) {
                            $("#customTabDtl").css("display", "none");
                            $("#partTabDtl").css("display", "block");
                            var html = "";
                            html += "<h3 style='text-align:center;'>Your Reference Number is : " + data.data.refNum + ". Kindly remember.</h3>";
                            html += "<p style='text-align:center;'>You have rated the following items as (Strongly Disagree, Very Dissatisfied, or Very Low). Please give instances/reasons to justify your ratings</p>";
                            $.each(data.data.Result, function (k1, v1) {
                                html += "<div class='form-group'><div class='col-md-12'><label>" + v1.ques_desc + " Your Rating : (" + v1.rating + "- " + v1.ratingDes + ")</label></div><div class='col-md-12'><textarea value='' id='t" + v1.que_code + "' class='form-control' rows='3' placeholder=''></textarea></div></div>";
                            });
                            html += '<div class="form-group"><ul class="list-inline pull-right"><li><a href="#"><button type="button" class="btn btn-primary" onclick="btnFinalSubmit(\'partTabDtl\',\'' + data.data.refNum + '\');">Submit</button></a></div></li></ul></div>';
                            document.getElementById("partTabDtl").innerHTML = html;
                        } else {
                            $("#customTabDtl").css("display", "none");
                            $("#finalTabDtl").css("display", "block");
                            console.log("reNum ::: in else condition :: " + data.data.refNum);
                            console.log("in submission else condition");
                            var pollrefNum = data.data.refNum;
                            var html = "<p>Thanks for taking part in Employee Satisfaction Survey, the management has decided for an anonymous feedback to take proper corrective actions and ensure that all your grievances are accounted for.</p>";
                            html += "<p>We would like to get your opinion as to whether the subsequent surveys be made anonymous or not, please vote your opinion.</p>";
                            html += "<p>Kindly 'CAST YOUR VOTE' so that we can decide on this the next survey, planned after 1 year.</p>";
                            html += "I prefer an open survey (not anonymous): ";
                            html += "<div class='form-group'><div class='col-md-4'></div><div class='col-md-4'><select class='form-control' id='pollIdDtl'>" +
                                "<option></option>" +
                                "<option value='T'>Yes</option>" +
                                "<option value='F'>No</option>"
                                + "</select></div><div class='col-md-4'></div></div></br>";
                            html += "<p style='text-align: center;margin-top: 10px;'><button type='button' class='btn btn-primary' onclick='btnPollSubmit(" + pollrefNum + ");'>Submit</button></p>";
                            document.getElementById("finalTabDtl").innerHTML = html;
                        }
                    }
                }
            });
        }
    }
}

function btnPollSubmit(pollrefNum) {
    var chkVal = $("#pollIdDtl").val();
    if (chkVal.trim() == "") {
        $("#pollIdDtl").css("border-color", "red");
        $("#pollIdDtl").notify("Select Poll", 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
    } else {
        $("#pollIdDtl").css("border-color", "#d2d6de");
        var quesCodeAns = $("#pollIdDtl").val();
        console.log("value are :: " + quesCodeAns);
        console.log("Poll Ref Num : " + pollrefNum);
        $.ajax({
            type: "GET",
            url: url + "/updatePoll/" + pollrefNum + "/" + quesCodeAns,
            headers: {Authorization: session},
            success: function (data, textStatus) {
                console.log("inside btnPollSubmit method");
                console.log(data);
                if (data.status == 200) {
                    $.notify("Thanks for submitting your survey", 'info', {
                        autoHide: true,
                        autoHideDelay: 5000,
                        clickToHide: true
                    });
                    clearEss();
                    changeContent('dashBoard');
                }
            }
        });
    }
}

function btnFinalSubmit(idVal, refNum) {
    var selectEle = $("#" + idVal).find("textarea");

    var reasonArray = [];
    for (var i = 0; i < selectEle.length; i++) {
        var id = selectEle[i].id;
        var quesCode = selectEle[i].id.substr(1);
        console.log("id :::: " + id);
        var chkVal = $("#" + id).val();
        if (chkVal.trim() == "") {
            $("#" + id).css("border-color", "red");
            $("#" + id).notify("Enter Description", 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
        } else {
            $("#" + id).css("border-color", "#d2d6de");
            var quesCodeAns = $("#" + id).val();
            console.log("value are :: " + quesCodeAns);
            var reasonJson = {
                "ques_no": quesCode,
                "remarks1": quesCodeAns
            };
            reasonArray.push(reasonJson);
        }
    }
    var json = {
        "reasons": JSON.stringify(reasonArray),
        "refNum": parseInt(refNum)
    };
    console.log(json);
    $.ajax({
        type: "POST",
        url: url + "/submitReason",
        headers: {Authorization: session},
        data: json,
        dataType: "json",
        success: function (data, textStatus) {
            console.log("inside btnFinalSubmit method");
            console.log(data);
            if (data.status == 200) {
                $("#partTabDtl").css("display", "none");
                $("#finalTabDtl").css("display", "block");
                var pollrefNum = data.data.refNum;
                var html = "<p>Thanks for taking part in Employee Satisfaction Survey, the management has decided for an anonymous feedback to take proper corrective actions and ensure that all your grievances are accounted for.</p>";
                html += "<p>We would like to get your opinion as to whether the subsequent surveys be made anonymous or not, please vote your opinion.</p>";
                html += "<p>Kindly 'CAST YOUR VOTE' so that we can decide on this the next survey, planned after 1 year.</p>";
                html += "I prefer an open survey (not anonymous): ";
                html += "<select class='form-control' id='pollIdDtl'>" +
                    "<option></option>" +
                    "<option value='T'>Yes</option>" +
                    "<option value='F'>No</option>"
                    + "</select>";
                html += "<p><button type='button' class='btn btn-primary' onclick='btnPollSubmit(" + pollrefNum + ");'>Submit</button></p>";
                document.getElementById("finalTabDtl").innerHTML = html;
            }
        }
    });
}

function clearEss() {
    $("#customTabDtl").find('textarea').val('');
    $("#customTabDtl").find('select').val('Select One');
    $("#partTabDtl").find('select').val('Select One');
    $("#partTabDtl").find('textarea').val('');
}