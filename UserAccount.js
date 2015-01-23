var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;

var Password = require('./Password.js');

var sqlServerConfig = {
    userName: process.env.AZURE_SQL_USERNAME,
    password: process.env.AZURE_SQL_PASSWORD,
    server: process.env.AZURE_SQL_SERVER,
    options: {
        encrypt: true,
        database: 'strv-moneta'
    }
};

module.exports.exists = function exists(email, callback) {
    "use strict";
    var connection = new Connection(sqlServerConfig);
    
    connection.on('connect', function (connectionError) {
        if (connectionError) {
            console.log(connectionError);
            callback(connectionError);
            return;
        }
        
        var request = new Request('select count(*) from [dbo].[Users] where Email = @email', function (requestError) {
            if (requestError) {
                console.log(requestError);
                connection.close();
                callback(requestError);
            }
        });
        request.addParameter('email', TYPES.VarChar, email);
        
        request.on('row', function (columns) {
            connection.close();
            var userExists = columns[0].value !== 0;
            callback(null, userExists);
        });
        
        connection.execSql(request);
    });
};

module.exports.validateCredentials = function (email, password, callback) {
    "use strict";
    var connection = new Connection(sqlServerConfig);
    
    connection.on('connect', function (connectionError) {
        if (connectionError) {
            console.log(connectionError);
            callback(connectionError);
            return;
        }
        
        var request = new Request("select PasswordHash from [dbo].[Users] where Email = @email", function (requestError, rowCount) {
            if (requestError) {
                connection.close();
                console.log(requestError);
                callback(requestError);
            }
            else if (rowCount === 0) {
                connection.close();
                callback(null, false);
            }
        });
        request.addParameter('email', TYPES.VarChar, email);
        
        request.on('row', function (columns) {
            connection.close();
            var storedHash = columns[0].value;
            Password.compareWithHash(password, storedHash, callback);
        });
        
        connection.execSql(request);
    });
};

module.exports.create = function (email, password, callback) {
    "use strict";
    Password.hash(password, function (error, passwordHash) {
        if (error) {
            callback(error);
        } else {
            var connection = new Connection(sqlServerConfig);
            
            connection.on('connect', function (connectionError) {
                if (connectionError) {
                    console.log(connectionError);
                    callback(connectionError);
                    return;
                }
                
                var request = new Request('insert into [dbo].[Users](Email, PasswordHash) values(@email, @passwordHash)', function (requestError, rowCount) {
                    connection.close();
                    if (requestError) {
                        console.log(requestError);
                        callback(requestError);
                    } else if (rowCount === 0) {
                        var insertError = new Error('User could not be created.');
                        console.log(insertError);
                        callback(insertError);
                    } else {
                        callback(null);
                    }
                });
                
                request.addParameter('email', TYPES.VarChar, email);
                request.addParameter('passwordHash', TYPES.VarChar, passwordHash);
                
                connection.execSql(request);
            });
        }
    });
};


