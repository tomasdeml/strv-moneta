var bcrypt = require('bcrypt-nodejs');

module.exports.hash = function(password, callback) {
    "use strict";
    bcrypt.genSalt(10, function(_, salt) {
        bcrypt.hash(password, salt, null, callback);
    });
};

module.exports.compareWithHash = function(password, hash, callback) {
    "use strict";
    bcrypt.compare(password, hash, callback);
};