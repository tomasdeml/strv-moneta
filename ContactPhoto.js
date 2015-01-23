var azure = require('azure-storage');

module.exports.upload = function(contactId, stream, streamLength, callback) {
    "use strict";
    var blobSvc = azure.createBlobService();
    blobSvc.createContainerIfNotExists('photoscontainer', function(containerError) {
        if (containerError) {
            callback(containerError);
        } else {
            blobSvc.createBlockBlobFromStream('photoscontainer', 'contact-' + contactId, stream, streamLength, function(blobError) {
                if (blobError) {
                    callback(blobError);
                } else {
                    callback(null);
                }
            });
        }
    });
};