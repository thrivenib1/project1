var utils = function () {

};

utils.dedupe = function (arr, cb) {
    var out = [];
    var itemsProcessed = 0;
    for (var i = 0, max = arr.length; i < max; i++) {
        if (out.indexOf(arr[i]) < 0) out.push(arr[i]);
        itemsProcessed++;
        if (itemsProcessed === arr.length) {
            cb(null, out);
        }
    }

};

utils.getAllRefNumber = function (results, cb) {
    var dupRefNumbers = results.map(function (a) {
        return a.refNumber;
    });
    cb(null, dupRefNumbers);
};


utils.getOverlappingDates = function (startDate, endDate, cb) {
    var dateFrom = startDate;
    var dateTo = endDate;
    var d1 = dateFrom.split("-");
    var d2 = dateTo.split("-");
    var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);  // -1 because months are from 0 to 11
    var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);

    var c = startDate.split("-");
    var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
    var exists = check >= from && check <= to;
    if (exists) {
        cb(exists, null);
    } else {
        var c1 = endDate.split("-");
        var check1 = new Date(c1[2], parseInt(c1[1]) - 1, c1[0]);
        var exists1 = check1 >= from && check1 <= to;
        if (exists1) {
            cb(exists, null);
        } else {
            cb(null, null);
        }
    }
};


module.exports = utils;