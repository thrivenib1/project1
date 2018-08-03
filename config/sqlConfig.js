// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = require('./config');

if (config.isLocal) {
    module.exports = {
        host:'localhost',
        user:'root',
        password:'root',
        database:'testdb'
    };
} else {
    module.exports = {
        host:'172.16.2.15',
        user:'root',
        password:'balki123',
        database:'testdb'
    };
}


