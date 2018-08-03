var kue = require('kue');
var redisConfig = require('../config/redisConfig');
var logger = require('../services/loggerService').infoLog;
var emailHelper = require('../helpers/emailHelper');


var kueUtils = function () {
};

kueUtils.jobs = kue.createQueue({
    prefix: redisConfig.redis_async_prefix,
    redis: {
        port: redisConfig.redis_async_port,
        host: redisConfig.redis_async_host
    }
});


kueUtils.createTask = function (jType,managerTemplate, templateNumber, jobtype, title, objectType, instanceId, template, cb) {

    var job = kueUtils.jobs.create(jobtype, {
        title: title,
        type: jType,
        objectType: objectType,
        instanceId: instanceId,
        taskData: template,
        empEmail: objectType,
        templateNumber: templateNumber,
        managerTemplate: managerTemplate
    }).save(function (err) {
        if (!err) {
            logger.info('Job save success. Id is ' + job.id);
            // No matter what, we return cb(null, true);
            cb(null, true);
        } else {
            logger.info('Job save failed.. :-(');
            // No matter what, we return cb(null, true);
            cb(null, true);
        }
    });
};


module.exports = kueUtils;