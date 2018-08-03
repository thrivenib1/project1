var winston = require('winston'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');
var config = require(path.join(__dirname, '..', '/config/config.js'));

mkdirp(config.logdir, function (err) {
    if (err) throw err;
});

// ALL > TRACE > DEBUG > INFO > WARN > ERROR > FATAL > OFF

// Define levels to be like log4j in java
var customLevels = {
    // Ex: debug -> info -> warning -> error.
    // A transport that handles info will not log debug messages but will log info, warning and error.
    levels: {
        verbose:3,
        trace: 4,
        debug: 3,
        info: 2,
        warn: 5,
        err: 1
    },
    colors: {
        verbose:'red',
        trace: 'cyan',
        debug: 'magenta',
        info: 'green',
        warn: 'yellow',
        err: 'red'
    }
};

module.exports = {
    errorLog: new winston.Logger({
        levels: customLevels.levels,
        colors: customLevels.colors,
        exceptionHandlers: [
            new winston.transports.File({filename: 'logs/exceptions.log'})
        ],
        transports: [
            new winston.transports.File({
                name: 'error-file',
                level: 'err',
                filename: 'logs/err.log',
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true
            })
        ],
        exitOnError: false
    }),
    warnLog: new winston.Logger({
            levels: customLevels.levels,
            colors: customLevels.colors,
            exceptionHandlers: [
                new winston.transports.File({filename: 'logs/exceptions.log'})
            ],
            transports: [
                new winston.transports.File({
                    name: 'request-file',
                    level: 'warn',
                    filename: 'logs/warn.log',
                    json: true,
                    maxsize: 5242880, //5MB
                    maxFiles: 5,
                    colorize: true
                }),
                new (winston.transports.Console)({
                    level: 'warn', // Only write logs of info level or higher
                    levels: 3,
                    colorize: true
                })
            ],
            exitOnError: false
        }
    ),

    infoLog: new winston.Logger({
            levels: customLevels.levels,
            colors: customLevels.colors,
            exceptionHandlers: [
                new winston.transports.File({filename: 'logs/exceptions.log'})
            ],
            transports: [
                new winston.transports.File({
                    name: 'info-file',
                    level: 'info',
                    filename: 'logs/info.log',
                    json: true,
                    maxsize: 5242880, //5MB
                    maxFiles: 5,
                    colorize: true
                }),
                new (winston.transports.Console)({
                    level: 'info', // Only write logs of info level or higher
                    levels: 1,
                    colorize: true
                })
            ],
            exitOnError: false,

        }
    ),

    debugLog: new winston.Logger({
        levels: customLevels.levels,
        colors: customLevels.colors,
        exceptionHandlers: [
            new winston.transports.File({filename: 'logs/exceptions.log'})
        ],
        transports: [
            new winston.transports.File({
                name: 'debug-file',
                level: 'debug',
                filename: 'logs/debug.log',
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true
            }),
            new (winston.transports.Console)({
                level: 'debug', // Only write logs of info level or higher
                //levels: customLevels.levels,
                colorize: true
            })
        ],
        exitOnError: false
    }),
    traceLog: new winston.Logger({
        levels: customLevels.levels,
        colors: customLevels.colors,
        exceptionHandlers: [
            new winston.transports.File({filename: 'logs/exceptions.log'})
        ],
        transports: [
            new winston.transports.File({
                name: 'trace-file',
                level: 'trace',
                filename: 'logs/trace.log',
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true
            })
        ],
        exitOnError: false
    }),
    verbose: new winston.Logger({
        levels: customLevels.levels,
        colors: customLevels.colors,
        exceptionHandlers: [
            new winston.transports.File({filename: 'logs/exceptions.log'})
        ],
        transports: [
            new winston.transports.File({
                name: 'verbose-file',
                level: 'verbose',
                filename: 'logs/verbose.log',
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true
            }),
            new (winston.transports.Console)({
                level: 'verbose', // Only write logs of info level or higher
                levels: 2,
                colorize: true
            })
        ],
        exitOnError: false
    })
}
;




