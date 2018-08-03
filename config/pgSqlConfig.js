// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = require('./config');


if (config.isLocal) {
    module.exports = {
        /*postgres://username:password@host:port/database?ssl=false&application_name=name&fallback_application_name=name*/
        connectionStringForOffproDb: 'postgres://postgres:postgres@localhost:5432/offpro_local',
        connectionStringForLeaveDb: 'postgres://postgres:postgres@localhost:5432/leave_test',
        connectionStringForESSDb: 'postgres://postgres:postgres@localhost:5432/ess',
        connectionStringForOffproTest: 'postgres://postgres:balki123@172.16.2.15:5432/offproj_test',
        connectionStringForMrbs: 'postgres://postgres:postgres@localhost:5432/mrbs'
    };
} else {
    module.exports = {
        connectionStringForOffproDb: 'postgres://postgres:balki123@172.16.2.15:5432/offproj_test',
        connectionStringForLeaveDb: 'postgres://postgres:balki123@172.16.2.15:5432/leave_test',
        connectionStringForESSDb: 'postgres://postgres:balki123@localhost:5432/ess',
        connectionStringForOffproTest: 'postgres://postgres:balki123@172.16.2.15:5432/offproj_test',
        connectionStringForMrbs: 'postgres://postgres:balki123@localhost:5432/mrbs'
    };
}


