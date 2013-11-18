"use strict";

var db = require("./db");

module.exports = {

    test: {
        get: function(req, res, callback){
            callback(null, true);
        }
    },

    safe: {

        get: function(req, res, callback){
            db.findOne("safe", {_id: req.identity}, function(err, data){
                if(err){
                    return callback(err);
                }
                return callback(null, data);
            });
        },

        post: function(req, res, callback){
            req.body._id = req.identity;
            db.save("safe", req.body, function(err){
                if(err){
                    return callback(err);
                }
                return callback(null, true);
            });
        }

    }
};
