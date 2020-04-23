'use strict'

var express = require('express');
var bodyparser = require('body-parser');

var app = express();

// cargar rutas
var user_routes = require('./routes/user');
var animals_routes = require('./routes/animals');

// middlewares

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header('Acess-Control-Allow-Headers', 'Authorization,X-API-KEY,Origin,X-Requested-With,Content-Type,Accept,Access-Control-Allow-Request-Method');
    res.header('Acess-Control-Allow-Methods', 'GET', 'POST', 'OPTIONS', 'PUT', 'DELETE');
    res.header('Allow', 'GET', 'POST', 'OPTIONS', 'PUT', 'DELETE');
    next();
});

// rutas base
app.use('/api', user_routes);
app.use('/api', animals_routes);

module.exports = app;