/*

Basic time skew estimation algorithm. We are only able to 
estimate based on start/end timestamps and a remote time stamp.
We do this by determining the approximate network latency and then 
determining what the clock skew must have been to allow the reported 
reading. 

Note this assumes symmetric latency, since we estimate one-way latency 
as RTT / 2. While not perfect, this generally is in the ballpark with 
other dev tools.

*/

(function(scope){
    
    // 
    // Constructor / initializer
    //
    var estimator = function(){};
    
    //
    // Single evaulation step
    //
    estimator.prototype.ComputeOffset = function(startTime, endTime, remoteTime){
        var offsetInfo = {};
        offsetInfo.Latency = (endTime - startTime) / 2.0;
        offsetInfo.Skew = startTime - (remoteTime - offsetInfo.Latency);
        return offsetInfo;  
    };
    
    //
    // Composite evaluation
    //
    estimator.prototype.ComposeOffsets = function(first, second){
        first.Latency -= second.Latency;
        first.Skew -= second.Latency;
        return first;
    };
    
    //
    // Exports
    //
    scope.Estimator = estimator;
})(this);