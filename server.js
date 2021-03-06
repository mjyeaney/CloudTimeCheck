/* global process, __dirname */

//
// Main node entry point. This file will be automatically
// bootstrapped by the Azure runtime.
//

//
// Pull in libs and bootstrap express application
//
var express = require('express'),
    http = require('http'),
    alg = require('./scripts/Estimator.js');
    
// Init the express engine
var app = express();

// Check for the PORT env var from the azure host
var port = process.env.PORT || 8009;

//
// Helper fn to set no-cache headers
//
var setNoCache = function(res){
    res.append('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
};

//
// Enable basic static resource support
//
app.use(express.static(__dirname, {
    index : 'default.html'
}));

//
// Returns the basic / default landing view
//
app.get('/Home', function(req, res){
    setNoCache(res);
    res.sendFile(__dirname + '/default.html');
});

//
// Endpoint to get our time data payload
//
app.get('/Time', function(req, res){
    // Make sure this response is not cached   
    setNoCache(res);
    
    // Set the time stampt when we're starting the request
    var storageReqStart = new Date().getTime();
    
    // Create a basic HTTP request. Notice that we're only making
    // an OPTIONS request. This is because we're only interested in the 
    // 'Date' header, and therefore have no need to download any 
    // payload. Note, in this specific example, all of these requests
    // will fail (status=400) due to missing CORS headers, but the 
    // Date header is still sent, meaning the errors don't matter.
    var storageRequest = http.request({
        method: 'options',
        host: 'cloudtimecheck.blob.core.windows.net'
    });
    
    // If any errors surface, make sure we complete the request
    storageRequest.on('error', function(data){
        res.json({
            Message: 'An unknown error occurred.'
        });
    });
    
    // Grab the normal response info
    storageRequest.on('response', function(data){
        
        // Correct the storage time using the symmetric 
        // method we use on the client. This is (of course)
        // subject to the same weaknesses details in TimeChecker.js.
        var est = new alg.Estimator(),
            storageReqEnd = new Date().getTime(),
            storageTime = new Date(data.headers.date).getTime(),
            offsetInfo = est.ComputeOffset(storageReqStart, storageReqEnd, storageTime);
            
        // Patch the offset with the local time
        offsetInfo.ServerTime = storageReqStart;
        
        // Send back a JSON payload with our readings.
        res.json(offsetInfo);  
    });
    
    // Mark the request as "ended", thereby sending it.
    storageRequest.end();
});

//
// Init server listener loop
//
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server now listening at http://%s:%s', host, port);
});