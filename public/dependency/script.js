var url = "http://172.16.2.16:5000";
//var url = "http://localhost:5000";
//var url = "http://172.16.1.165:5000";



localStorage.setItem("url", url);

//window.onclick = function (e) {
//    if (e.target.localName == 'a') {
//        console.log(e.target);
//        console.log(e.target.href);
//    }
//};

function changeContent(templateName) {
    //alert(templateName);
    var token = localStorage.getItem('session');
    //var token = localStorage.getItem('token');'
    console.log("token :: " + token);

    if (token) {
        console.log("---------- SESSION EXIST");
        var data = {token: token};
        $('#content').children().remove();
        $("#content").load("/qms/" + templateName, data);
    } else {
        console.log("---------- SESSION DOES NOT EXIST");
        location.href = "/IMSWiki/login";
    }
}

function logout() {

    var token = localStorage.getItem('session');
    $.ajax({
        type: "GET",
        url: url + "/logout",
        headers: {Authorization: token},
        success: function (data, textStatus) {
            localStorage.clear();
            location.href = "/IMSWiki/login"
        }
    })
}

function renderHtml(url) {
    console.log("inside render");
    var token = localStorage.getItem('session');
    if (token) {
        console.log("---------- SESSION EXIST");
        location.href = url;
    } else {
        console.log("---------- SESSION DOES NOT EXIST");
        location.href = "/IMSWiki/login"
    }
}

function logout() {
    localStorage.clear();
    console.log("---------- SESSION DOES NOT EXIST");
    location.href = "/IMSWiki/logout"
}

function login() {
    console.log(url);
    var validate = false;
    if ($('#email').val().length <= 0) {
        $('#email').notify('Please enter Username.', 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = true;
    } 
    if ($('#pwd').val().length <= 0) {
        $('#pwd').notify('Please enter password.', 'error', {
            autoHide: true,
            autoHideDelay: 5000,
            clickToHide: true
        });
        validate = true;
    }
    if ($('#email').val().length > 0) {
        var reasonRegex = /^[^-\s][a-zA-Z0-9_\s-]+$/;
        if(!($('#email').val()).match(reasonRegex)){
            $('#email').notify('Special characters are not allowed', 'error', {
                autoHide: true,
                autoHideDelay: 5000,
                clickToHide: true
            });
            validate = true;
        }
    }
    if(validate == false) {
        console.log("trying to load " + url);
        $.ajax({
            type: "POST",
            url: url + "/login",
            data: {"username": $("#email").val(), "password": $("#pwd").val()},
            dataType: "json",
            success: function (data, textStatus) {
                if (data.status == 200) {
                    localStorage.setItem('userProfile', JSON.stringify(data.data.Profile[0]));
                    console.log("Login token :: " + data.data.Result[0].token);
                    localStorage.setItem('session', data.data.Result[0].token);
                    localStorage.setItem('userDetails', JSON.stringify(data.data.Result[0]));
                    localStorage.setItem('DOB', JSON.stringify(data.data.DOB));
                    localStorage.setItem('managerProfileDetails', JSON.stringify(data.data.ManagerProfile[0]));
                    if (data.data.Result[0].isManager) {
                        var managerMenu = '<li><a href="#" onclick="changeContent(\'managerDashboard\')"><i class="fa fa-dashboard"></i>Leave Approvals</a></li>';
                        managerMenu += '<li><a href="#" class="active" onclick="changeContent(\'requestLeave\')"><i class="fa fa-envelope"></i>Request Leave</a></li>';
                        managerMenu += '<li><a href="#" onclick="changeContent(\'leaveHistory\')"><i class="fa fa-history"></i>Leave History</a></li>';
                        managerMenu += '<li><a href="#" onclick="changeContent(\'employeeList\')"><i class="fa fa-users"></i>Employee list</a></li>';
                        managerMenu += '<li><a href="#" onclick="changeContent(\'holidayList\')"><i class="fa fa-calendar-check-o"></i>Holiday List</a></li>';
                        managerMenu += '<li><a href="#" onclick="changeContent(\'empContactDetails\')"><i class="fa fa-phone-square"></i>Emp Contact Details</a></li>';
                        managerMenu += '<li><a href="#" onclick="changeContent(\'iLTSHelp\')"><i class="fa fa-info-circle"></i>Help</a></li>';

                        localStorage.setItem('empMenuDtl', managerMenu);
                    } else {
                        var empMenu = '<li><a href="#" onclick="changeContent(\'requestLeave\')"><i class="fa fa-envelope"></i>Request Leave</a></li>';
                        empMenu += '<li><a href="#" onclick="changeContent(\'leaveHistory\')"><i class="fa fa-history"></i>Leave History</a></li>';
                        empMenu += '<li><a href="#" onclick="changeContent(\'holidayList\')"><i class="fa fa-calendar-check-o"></i>Holiday List</a></li>';
                        empMenu += '<li><a href="#" onclick="changeContent(\'iLTSHelp\')"><i class="fa fa-info-circle"></i>Help</a></li>';

                        localStorage.setItem('empMenuDtl', empMenu);
                    }
                    location.href = "/IMSWiki/imswiki";
                } else {
                    console.log(data.data.Error.message);
                    if (data.data.Error.message === undefined) {
                        $('#pwd').val("");
                        $.notify("Invalid Username/Password", 'error', {
                            autoHide: true,
                            autoHideDelay: 5000,
                            clickToHide: true
                        });
                    } else {
                        $('#pwd').val("");
                        $.notify(data.data.Error.message, 'error', {
                            autoHide: true,
                            autoHideDelay: 5000,
                            clickToHide: true
                        });
                    }
                }
            }
        });
    }
}


function renderHtml(url) {
    console.log("inside render");
    var token = localStorage.getItem('session');
    if (token) {
        console.log("---------- SESSION EXIST");
        location.href = url;
    } else {
        console.log("---------- SESSION DOES NOT EXIST");
        location.href = "/IMSWiki/login"
    }
}
