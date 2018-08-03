var g_msg = require('../utils/flashMessageStrings').g_msg;
var status = require('../utils/flashMessageStrings').status;
var Const = require('../utils/flashMessageStrings').CONST;


var flashMessage = function () {
};

flashMessage.error = function (code, data, token) {
    return flashMessage.flash_notrace(code, g_msg[code], data, token);
};

flashMessage.success = function (code, data, token) {
    return flashMessage.flash_notrace(code, g_msg[code], data, token);
};

flashMessage.getText = function (msg) {
    return g_msg[msg];
};

flashMessage.flash_notrace = function (code, msg, data, token) {
    return {
        message: msg,
        status: status[code],
        data: data,
        token: token
    };
};

module.exports = flashMessage;