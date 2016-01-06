//
// Main node entry point. This file will be automatically
// bootstrapped by the Azure runtime.
//

//
// Pull in libs and bootstrap express application
//
var express = require('express')
var app = express();

// Check for the PORT env var from the azure host
var port = process.env.PORT || 8008;

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
// Setup route handlers
//
app.get('/Home', function(req, res){
    setNoCache(res);
    res.sendFile(__dirname + '/default.html');
});
app.get('/Model', function(req, res){
    setNoCache(res);
    res.sendFile(__dirname + '/model.html'); 
});
app.post('/Model', function(req, res){
    setNoCache(res);
    console.log("TODO: Received POST to /model:");
    //console.log(req);
    res.status(200).end();
});

//
// Init server listener loop
//
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server now listening at http://%s:%s', host, port);
});