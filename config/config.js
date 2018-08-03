module.exports = {
    'ttl': 0, //Do not expire
    'resetTokenExpiresMinutes': 20, //20 minutes later
    'logdir': 'logs',
    'debuglog': '/debug.log',
    'tracelog': '/trace.log',
    'infolog': '/info.log',
    'errlog': '/err.log',
    'warnlog': '/warn.log',
    'datalog': '/ldata.log',
    'tokenSecret': 'e$q!8&y*3b3.3dr!e',
    'cookiename': 'imsswiki',
    'port': 5000,
    'max_length': 50,
    'name': 'imsswiki',
    'usecluster': 0, // 1 for using cluster and 0 for not using cluster (typically in dev environment)
    'kue_dashboard_port': '4004',
    'displayToken': true, //display the token which is generated while token handshake,
    'isLocal': true,
    'maxClLeaves': 12
};
