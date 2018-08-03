var config = require('./config');


 if (config.isLocal) {
    module.exports = {
        'redis_async_host': 'localhost',
        'redis_async_port': '6379',
        'redis_async_prefix': 'integra',//changing this will create new instance
        'redis_session_timeout_sec': 600000000,//msec
        'redis_session_host': 'localhost',//27017
        'redis_session_port': 6379,
        'redis_session_key_prefix': 'iLTS'//redis key prefix
    };
} else {
     module.exports = {
         'redis_async_host': 'localhost',
         'redis_async_port': '6379',
         'redis_async_prefix': 'integraImanage',//changing this will create new instance
         'redis_session_timeout_sec': 600000000,//msec
         'redis_session_host': 'localhost',//27017
         'redis_session_port': 6379,
         'redis_session_key_prefix': 'iLTSImanage'//redis key prefix
     };
 }