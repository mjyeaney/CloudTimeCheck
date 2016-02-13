/* global Estimator */

var alg = require('../scripts/estimator.js'),
    est = new alg.Estimator();

//
// First, the server offsets
//
var serverStartTime = 30.0,
    serverEndTime = 70.0,
    storageTime = 5.0;
var serverOffsets = est.ComputeOffset(serverStartTime, serverEndTime, storageTime);
console.log('ServerOffset: ' + JSON.stringify(serverOffsets));
console.log();

//
// Next, client offsets
//
var clientStartTime = 0.0,
    clientEndTime = 60.0,
    serverTime = 30.0;
var clientOffsets = est.ComputeOffset(clientStartTime, clientEndTime, serverTime);
console.log('ClientOffset: ' + JSON.stringify(clientOffsets));
console.log();

//
// We now need to compose the two offsets we have, since the 
// clientOffset is influenced by the server offset
//
var composedOffsets = est.ComposeOffsets(clientOffsets, serverOffsets);
console.log('ComposedOffset: ' + JSON.stringify(composedOffsets));
console.log();