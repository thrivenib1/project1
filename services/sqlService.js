var sqlConfig = require('../config/sqlConfig');
var logger = require('../services/loggerService').infoLog;
var mysql = require('mysql');
var sqlService = function () {
};

//establishing a connection once
sqlService.sqlConnection = mysql.createConnection({
    host: sqlConfig.host,
    user: sqlConfig.user,
    password: sqlConfig.password,
    database: sqlConfig.database
});

logger.info("Connected to Sql for database - " + sqlConfig.database);


module.exports.sqlConnection = sqlService.sqlConnection;
module.exports = sqlService;
