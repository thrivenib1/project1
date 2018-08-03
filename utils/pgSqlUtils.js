var logger = require('../services/loggerService').infoLog;
var pgSqlUtils = {};

/**
 * used to perform query execution
 * client >> specifies the connection of database (either offpro or leave Db)
 * dbQuery >> query which has to be executed
 * values >> array of values required for query
 * cb >> callback
 * */

pgSqlUtils.executeQuery = function (client, dbQuery, values, cb) {

    client.query(dbQuery, values)
        .then(function (data) {
            cb(null, data);
        })
        .catch(function (error) {
            cb(error, null);
        });
};

module.exports = pgSqlUtils;