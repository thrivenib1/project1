var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mlogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cluster = require('cluster');
var ess = require('./routes/ess');


//routes
//initialize redis(session manager)
var session = require('./services/sessionService').initSessionMgr();
var user = require('./routes/user');
var leave = require('./routes/leave');
var reportingHead = require('./routes/reportingHead');
var hr = require('./routes/hr');
var notification = require('./routes/notification');
var graph = require('./routes/graph');
var mrbs = require('./routes/mrbs');

var numCPUs = require('os').cpus().length;
var config = require('./config/config');
var index = require('./routes/index');
var qms = require('./routes/qms');
var ilts = require('./routes/ilts');
var admin = require('./routes/admin');
var emp = require('./routes/employee');
var reimbursement = require('./routes/reimbursement');
var logger = require('./services/loggerService').infoLog;
var errLog = require('./services/loggerService').errorLog;
var pqSqlMgr = require('./services/pgSqlService');
var sqlMgr = require('./services/sqlService');
var sessionUtils = require('./utils/sessionUtils');
var kueService = require('./services/kueService');
var asynctask = require('./utils/asyncTask');
var dbConnection = require('./db/connection');
var fileUpload = require('express-fileupload');
var traceLog = require('./services/loggerService').traceLog;
var adminCtr = require('./controllers/adminController');
var cors=require('cors');
//require('events').EventEmitter.defaultMaxListeners = Infinity;

var app = express();

app.use(cors({origin:true,credentials: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.set('views', __dirname + '/public');
app.use(mlogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    traceLog.trace('current request ============ ', req.method, req.url, ip, ' ===================== ');
    next();
});

// Initialize the job processor
if (config.usecluster === 0) {
    pqSqlMgr.initPgSqlConnection();
    sessionUtils.setMiddleware(app);
    kueService.init();
    kueService.handleJobs();
    kueService.initJobs();
    adminCtr.createAdminDoc();

    app.use('/', index);
    app.use('/', user);
    app.use('/', leave);
    app.use('/', reportingHead);
    app.use('/', hr);
    app.use('/', notification);
    app.use('/', admin);
    app.use('/', reimbursement);
    app.use('/', qms);
    app.use('/IMSWiki', ilts);
    app.use('/', graph);
    app.use('/', ess);
    app.use('/', emp);
    app.use('/', mrbs);
} else {
    if (cluster.isMaster) {
        kueService.init();
        kueService.handleJobs();
        adminCtr.createAdminDoc();

        logger.info('Fork %s worker(s) from master', numCPUs);
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('online', function (worker) {
            logger.info('Worker is running on %s pid', worker.process.pid);
        });

        cluster.on('exit', function (worker, code, signal) {
            logger.info('Worker with %s is closed', worker.process.pid);
            cluster.fork();
        });

    } else if (cluster.isWorker) {
        kueService.initJobs();
        logger.info(' This is worker ');
        pqSqlMgr.initPgSqlConnection();
        sessionUtils.setMiddleware(app);

        app.use('/', index);
        app.use('/', user);
        app.use('/', leave);
        app.use('/', reportingHead);
        app.use('/', hr);
        app.use('/', notification);
        app.use('/', admin);
        app.use('/', reimbursement);
        app.use('/', qms);
        app.use('/IMSWiki', ilts);
        app.use('/', graph);
        app.use('/', ess);
        app.use('/', emp);
        app.use('/', mrbs);
    }
}
asynctask.asynctask.init();
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * @usage  >> Error handler for all the express middleware
 */
app.use(function (err, req, res, next) {
    errLog.err("error from app.js >> " + err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //error returned from middleware
    if (err) {
        errLog.err("Error from app.js 404");

        if(req.user && req.user[0])
        {
            res.json({status: 404, Error: err, Token: req.user[0].token});
        } else {
            res.json({status: 404, Error: err});
        }

    } else {
        res.render('error');
    }
});


/**
 *
 * @usage >> Process termination handler
 *           SIGINT is a program interrupt signal, which is sent when an user presses Ctrl+C
 *           SIGTERM is a termination signal, which is sent to a process to request its termination, but it can be caught and interpreted or ignored by the process.
 */
process.on('SIGINT', function () {
    // shut down the mongoose connections
    logger.info('Process exited through app termination');
    kueService.jobs.shutdown(function (err) {
        if (!err) {
            logger.info('Job queue shutdown successfully');
        }
        else {
            logger.info('Shutting down Job queue failed.');
        }
        process.exit(0);
    });
});


process.setMaxListeners(0);
if (config.usecluster === 0 || cluster.isWorker) {
    app.set('port', process.env.PORT || config.port);

    var server = app.listen(app.get('port'), function () {
        logger.info('Server listening on port ' + server.address().port);
    });
}
module.exports = app;
