var kue = require('kue'),
    logger = require('../services/loggerService').infoLog,
    cluster = require('cluster'),
    redisConfig = require('../config/redisConfig'),
    config = require('../config/config'),
    emailHelper = require('../helpers/emailHelper'),
    asynctask = require('../utils/asyncTask'),
    kueConfig = require('../config/kueConfig');

var q = function () {
};

q.jobs = kue.createQueue({
    prefix: redisConfig.redis_async_prefix,
    redis: {
        port: redisConfig.redis_async_port,
        host: redisConfig.redis_async_host
    }
});

q.init = function () {
    logger.info("kue service started");
    kue.app.listen(config.kue_dashboard_port);
};

q.handleJobs = function () {
    q.jobs.on('job complete', function (id, result) {
        // What to be done?
        kue.Job.get(id, function (err, job) {
            if (err) {
                logger.info('job-complete Error fetching the completed job ' + id);
                return;
            }
            if (job.data.taskId) {
                job.remove(function (err) {
                    if (err) {
                        logger.info('job-complete Removal of completed job failed ' + job.id);
                        return;
                    }
                    logger.info('job-complete Removed completed job #%d', job.id);
                });
            } else {
                job.remove(function (err) {
                    if (err) {
                        logger.info('job-complete Removal of completed job failed ' + job.id);
                        return;
                    }
                    logger.info('job-complete Removed completed job #%d', job.id);
                });
            }
        });
    });

    q.jobs.on('job failed', function (id) {
        // What to be done? Possible to add again to the queue with 5 minute delay
        //delay should happen when the job failed with n number of attempts
        //configure the delay time
        logger.info('Job id is ' + id);
        kue.Job.get(id, function (err, job) {
            if (err) {
                logger.info('Error fetching the completed job ' + id);
                return;
            }
            if (job.data.taskId) {
                job.remove(function (err) {
                    if (err) {
                        logger.info('job-failed Removal of completed job failed ' + job.id);
                        return;
                    }
                    logger.info('job-failed Removed completed job #%d', job.id);
                });
            } else {
                job.remove(function (err) {
                    if (err) {
                        logger.info('job-failed Removal of completed job failed ' + job.id);
                        return;
                    }
                    logger.info('job-failed Removed completed job #%d', job.id);
                });
            }
        });
    });
};

//initJobs has to be initiated in app.js when server starts

q.initJobs = function () {
    // Worker for email jobs
    q.jobs.process(kueConfig.emailService, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });

    // Worker for gcm jobs
    q.jobs.process(kueConfig.gcmPushService, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });

    // Worker for gcm jobs
    q.jobs.process(kueConfig.postLeaveRequest, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });

    // Worker for gcm jobs
    q.jobs.process(kueConfig.postLeaveRequestApprove, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });

    q.jobs.process(kueConfig.postLeaveRequestReject, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });

    q.jobs.process(kueConfig.postLeaveRequestCancel, 1, function (job, done) {
        if (config.usecluster) {
            logger.info('Worker with %d is processing the job id %d', (cluster.worker) ? cluster.worker.id : 0, job.id);
        }
        return asynctask.asynctask.dispatch(job, done);
    });
};


module.exports = q;
