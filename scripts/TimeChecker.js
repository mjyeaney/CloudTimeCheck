/* global $ */

//
// The core time checker logic itself.
//
// TODO: Need to extract the following dependencies:
//
//      - XHR / Network calls
//      - Timer functions (setTimeout)
//

(function(scope){
    // 
    // Make sure requirements are loaded (TODO: Other ways to do this?)
    //
    if (!scope.Network){
        throw "Unable to located required module 'Network'."
    }
    
    // Make sure our object doesn't already exist
    // before defining it.
    if (!scope.TimeChecker){
        scope.TimeChecker = function(options){

            // Deafult options if none provided
            if (!options){
                options = {};
                options.CorrectLatency = true;
                options.TestDelay = 10;
                options.TestCount = 200;
            }
            
            // Local scope and control flags
            var self = this,
                stopTest = false,
                testCount = 0;
                
            // Test result collections and tracking flags
            var webServerDeltas = [],
                latencies = [],
                storageDeltas = [],
                start = 0.0,
                end = 0.0,
                latency = 0.0;
            
            // Function used to run a single test method
            var beginSingleTest = function(){
                if ((testCount < options.TestCount) && (!stopTest)){
                    
                    // Make call to get data
                    $.ajax({
                        url: '/Time',
                        beforeSend: function(){
                            // Begin test run: first take time snapshot of our time.
                            start = new Date().getTime();                            
                        },
                        success: function(data){
                            completeSingleTest(data);
                        }
                    });
                } else {
                    completeTest();
                }
            };
            
            // Callback method to perform test measurements
            var completeSingleTest = function(data){
                //
                // Take another snapshot of the current timer now.
                // We want to try to isolate the round-trip latency
                // in order to remove effects of the network. In order to
                // do this, we want *half* of the measured round-trip time, 
                // since the server time was sample mid-way through this time
                // (NOTE: this is approximate, and assumes symmetric latency).
                //
                // While not perfect, informal testing shows this agrees with 
                // the Chrome developer tools latency measurement, so we're definitely
                // within the ballpark.
                //
                end = new Date().getTime();
                latency = (end - start) / 2.0;
                
                // compute/save time delta (check options for corrections)
                if (options.CorrectLatency){
                    webServerDeltas.push(start - (data.ServerTime - latency));
                } else {
                    webServerDeltas.push(start - data.ServerTime);
                }
                
                // save latency reading and storage delta
                storageDeltas.push(data.StorageDelta);                            
                latencies.push(latency);
                
                // Invoke callback (if supplied)
                if (self.OnNextResult){
                    self.OnNextResult({
                        Latencies : latencies,
                        WebserverDeltas : webServerDeltas,
                        StorageDeltas : storageDeltas
                    });
                }

                // Increment call count
                testCount++;
                
                // Fire off again after RETRY delay
                if (!stopTest){
                    setTimeout(beginSingleTest, options.TestDelay);
                } else {
                    completeTest();
                }
            };
            
            // Ends a test run, and invokes the completion callback.
            var completeTest = function(){
                testCount = 0;
                
                if (self.OnComplete){
                    self.OnComplete();
                }                
            };
            
            //
            // "Public" methods / properties / callbacks
            //
            
            // callback methods
            self.OnNextResult = null;
            self.OnComplete = null;
            
            // starts the checker
            self.Start = function(){
                setTimeout(beginSingleTest, options.TestDelay);
            };
            
            // Stops the active run (if any)
            self.Stop = function(){
                stopTest = true;
            };
        };
    }
})(this);