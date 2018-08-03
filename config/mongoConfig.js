var config = require('./config');

if (config.isLocal) {
    module.exports = {
        'mongo_url': 'mongodb://localhost/integra'
    };
} else {
    module.exports = {
        'mongo_url': 'mongodb://localhost:27017/integra'
    };
}