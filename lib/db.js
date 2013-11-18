"use strict";

var config = require("../config/" + (process.env.NODE_ENV || "development") + ".json"),
    mongodb = require("mongodb"),
    mongoserver = new mongodb.Server(config.mongo.host, config.mongo.port || 27017, {auto_reconnect: true}),
    db_connector = new mongodb.Db(config.mongo.name, mongoserver, {safe: false}),
    dbObj;

module.exports.init = function(callback){

    var indexes = [
        //{collection: "user", data: {id: 1}}
    ];

    db_connector.open(function(err, db){
        if(err){
            return callback(err);
        }

        dbObj = db;

        var ensureIndexes = function(){
            var index = indexes.shift();
            if(!index){
                return callback(null, dbObj);
            }
            db.ensureIndex(index.collection, index.data, ensureIndexes);
        };

        ensureIndexes();
    });
};

module.exports.save = function(collectionName, record, callback){
    record = record || {};
    var id = record._id;

    dbObj.collection(collectionName, function(err, collection){
        if(err){
            return callback(err);
        }
        collection.save(record, {safe: true}, function(err, record){
            if(err){
                return callback(err);
            }
            return callback(null, record && (id || record._id) || false);
        });
    });
};

module.exports.findOne = function(collectionName, query, callback){
    dbObj.collection(collectionName, function(err, collection){
        if(err){
            return callback(err);
        }
        collection.findOne(query, function(err, record){
            if(err){
                return callback(err);
            }
            record._id = undefined;
            callback(null, record || false);
        });
    });
};

module.exports.remove = function(collectionName, query, callback){
    dbObj.collection(collectionName, function(err, collection){
        if(err){
            return callback(err);
        }
        collection.remove(query, {safe: true}, function(err, record){
            if(err){
                return callback(err);
            }
            callback(null, !!record);
        });
    });
};
