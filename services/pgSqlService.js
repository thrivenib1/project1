var pgp = require('pg-promise')();
var pgSqlConfig = require('../config/pgSqlConfig');
var pgSqlService = function () {
};
//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients

//initialize pgSqlService connection
pgSqlService.initPgSqlConnection = function () {

    //offpro >> databasename
    //leave  >> databasename
    //ess    >> databasename
    //mrbs    >> databasename

    //it is used to establish the connection
    pgSqlService.offproClient = pgp(pgSqlConfig.connectionStringForOffproDb);

    pgSqlService.leaveClient = pgp(pgSqlConfig.connectionStringForLeaveDb);

    pgSqlService.essClient = pgp(pgSqlConfig.connectionStringForESSDb);

    pgSqlService.offproTestClient = pgp(pgSqlConfig.connectionStringForOffproTest);

    pgSqlService.mrbsClient = pgp(pgSqlConfig.connectionStringForMrbs);

};

module.exports = pgSqlService;