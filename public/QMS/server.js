'use strict';
const express = require('express');
const path = require('path')

const app = express();

global.__base = path.join(__dirname);
global.__viewsDependency = path.join(__dirname,"/pages");
global.__jsDependency = path.join(__dirname,"..//","/bower_components");
global.__cssDependency = path.join(__dirname,"/","bower_components");


//
//console.log("__jsDependency "+__jsDependency);
console.log("__base "+__base);
console.log("__viewsDependency "+__viewsDependency);
console.log("__jsDependency "+__jsDependency);
console.log("__cssDependency "+__cssDependency);

app.set('views', __viewsDependency);
app.set('css', __cssDependency);
//app.set('js', __jsDependency);
//
//app.set('images', __dirname + '\\production\\images');
//console.log(__dirname + '\\production\\images');
//app.set('images', __dirname + '\\production\\images');

//app.use('/static', express.static('production'));


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//app.use(express.static(__dirname + '/pages'));

//app.engine('html', require('ejs').renderFile);

require('./app/routes')(app);

const server = app.listen(3000, function () {
    const hostAddress = server.address().address;
    const port = server.address().port;
    console.log('listening at http://%s:%s', hostAddress, port);
});