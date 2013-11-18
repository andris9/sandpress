"use strict";

var config = require("../config/" + (process.env.NODE_ENV || "development") + ".json"),
    pathlib = require("path"),
    express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    db = require("./db"),
    yub = require("yub");

yub.init(config.yubikey.client_id, config.yubikey.secret_key);

// Express.js configuration
app.configure(function(){

    // HTTP port to listen
    app.set("port", config.web.port);
    // Define path to EJS templates
    app.set("views", pathlib.join(__dirname, "..", "www", "views"));
    // Use EJS template engine
    app.set("view engine", "ejs");
    // Use gzip compression
    app.use(express.compress());
    // Parse POST requests
    app.use(express.json());
    app.use(express.urlencoded());
    // Log requests to console
    app.use(express.logger(config.web.loggerInterface));

    app.use(function(req, res, next){
        if(!req.url.match(/^\/api\//i)){
            return next();
        }

        var authenticate = function(otp, callback){
            if(!otp || otp.length <= 32){
                return callback(new Error("Missing authentication token"));
            }

            if(typeof req.body != "object"){
                return callback(new Error("Invalid data for storing"));
            }

            yub.verify(otp, function(err, data){
                if(err){
                    return callback(err);
                }
                if(!data || !data.valid){
                    return callback("Auth failed");
                }

                return callback(null, data.identity);
            });
        };

        authenticate((req.headers["x-auth-otp"] || "").toString(), function(err, identity){
            if(err){
                res.status(403);
                res.setHeader("Content-Type", "application/json");

                res.send(JSON.stringify({
                    status: false,
                    error: "Missing or invalid authentication data"
                }, false, 4));
                return;
            }

            req.identity = identity;
            next();
        });

    });

    // run the router in this step
    app.use(app.router);
    // Define static content path
    app.use(express["static"](pathlib.join(__dirname, "..", "www", "static")));
    //Show error traces
    app.use(express.errorHandler());
});

require("./api-routes")(app);

app.get("/", function(req, res){
    res.status(200);
    res.setHeader("Content-Type", "text/html");
    res.render("index");
});

db.init(function(err){
    if(err){
        console.log("Failed opening database");
        console.log(err);
    }else{
        console.log("Database opened");

        server.listen(app.get("port"), function(err){
            if(err){
                console.log("Failed starting HTTP server\n%s", err.stack);
                process.exit(1);
                return;
            }
            console.log("HTTP server running at http://%s:%s/", config.web.host, config.web.port);

            try{
                process.setgid("nogroup");
            }catch(E){
                try{
                    process.setgid("nobody");
                }catch(E){
                    console.log("Failed downgrading group");
                }
            }
            
            try{
                process.setuid("nobody");
            }catch(E){
                console.log("Failed downgrading user");
            }
        });
    }
});

