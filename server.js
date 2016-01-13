/* global process, __dirname */
//
// Main node entry point. This file will be automatically
// bootstrapped by the Azure runtime.
//

//
// Pull in libs and bootstrap express application
//
var express = require('express'),
    http = require('http');
    
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
// Server route handlers
//
app.get('/Home', function(req, res){
    setNoCache(res);
    res.sendFile(__dirname + '/default.html');
});

app.get('/Time', function(req, res){
    var storageReqStart = 0.0;
    
    setNoCache(res);
    
    var storageRequest = http.request({
        method: 'options',
        host: 'mjycdndemo1282015.blob.core.windows.net'
    });
    
    storageRequest.on('error', function(data){
        res.json({
            Message: 'An unknown error occurred.'
        });
    });
    
    storageRequest.on('response', function(data){
        var webServerTime = new Date().getTime();
        var localLatency = (storageReqStart - webServerTime) / 2.0;
        res.json({
            ServerTime: webServerTime,
            StorageDelta: webServerTime - (new Date(data.headers.date).getTime() - localLatency)
        });  
    });
    
    storageReqStart = new Date().getTime();
    
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