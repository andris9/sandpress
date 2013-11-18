"use strict";

var cluster = require('cluster'),
    numCPUs = require('os').cpus().length + 1;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(){
        setTimeout(function(){
            cluster.fork();
        }, 1000);
    });
} else {
    require("./lib/server.js");
}

