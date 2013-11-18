"use strict";

var api = require("./api");

module.exports = function(app){

    app.get("/api/:action", apiHandler);
    app.get("/api/:action/:id", apiHandler);

    app.post("/api/:action", apiHandler);
    app.post("/api/:action/:id", apiHandler);

    app.put("/api/:action", apiHandler);
    app.put("/api/:action/:id", apiHandler);

    app.delete("/api/:action", apiHandler);
    app.delete("/api/:action/:id", apiHandler);

};

function apiHandler(req, res){
    var action = (req.params.action || "").toString().toLowerCase(),
        method = req.method.toLowerCase();

    if(action && api.hasOwnProperty(action) && typeof api[action][method] == "function"){
        api[action][method](req, res, function(err, data){
            if(err){
                response(req, res, false, err.message || err);
            }else{
                response(req, res, true, data);
            }
        });
    }else{
        response(req, res, false, "Invalid API action", 404);
    }
}

function response(req, res, success, data, status){
    var responseData = {};

    res.setHeader("Content-Type", "application/json");

    if(!success){
        res.status(status || 500);
        responseData.status = false;
        responseData.error = data || "Request could not be fulfilled";
    }else{
        res.status(200);
        responseData.status = true;
        responseData.data = data;
    }

    res.send(JSON.stringify(responseData, false, 4));
}