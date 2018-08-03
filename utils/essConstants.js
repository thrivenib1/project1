module.exports={
    ratingCode : 'R',
    importanceCode : 'I'
};

var rating = function () {
};

rating.arr = [];
rating.arr[1] = "Strongly Disagree";
rating.arr[2] = "Disagree";
rating.arr[3] = "Neutral";
rating.arr[4] = "Agree";
rating.arr[5] = "Strongly Agree";


var important = function () {
};

important.arr = [];
important.arr[1] = "Not Applicable";
important.arr[2] = "Not Important";
important.arr[3] = "Important";
important.arr[4] = "Very Important";
important.arr[5] = "Extremely Important";








module.exports.rating = rating;
module.exports.important = important;


