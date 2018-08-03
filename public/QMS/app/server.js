'use strict';
const express = require('express');
const path = require('path')

const app = express();

//global.__base = path.join(__dirname);
global.__viewsDependency0 = path.join(__dirname,"..//","/pages");
global.__viewsDependency1 = path.join(__dirname,"..//","/pages/qms");
global.__viewsDependency2 = path.join(__dirname,"..//","/pages/isecure");
global.__viewsDependency3 = path.join(__dirname,"..//","/pages/workaids");


global.__imgDependency0 = path.join(__dirname,"..//","/images/QMS");



app.set('views', [__viewsDependency0,__viewsDependency1,__viewsDependency2,__viewsDependency3]);
//app.set('images', [__imgDependency0]);

//app.set('views', __viewsDependency);
//app.set('css', __cssDependency);
//app.set('js', __jsDependency);
//
//app.set('images', __dirname + '\\production\\images');
//console.log(__dirname + '\\production\\images');
//app.set('images', __dirname + '\\production\\images');

//app.use('/static', express.static('production'));


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

global.__staticDependency = path.join(__dirname,"..//","/bower_components");
app.use(express.static(__staticDependency));
console.log("__dirname + '/bower_components' "+__staticDependency)
//app.engine('html', require('ejs').renderFile);

require('../app/routes')(app);

const server = app.listen(3000, function () {
    const hostAddress = server.address().address;
    const port = server.address().port;
    console.log('listening at http://%s:%s', hostAddress, port);
});