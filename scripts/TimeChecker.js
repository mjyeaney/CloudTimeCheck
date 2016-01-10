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
                options.TestDelay = 50;
                options.TestCount = 100;
            }
            
            // Apply any options
            var self = this,
                stopTest = false,
                calls = 0, 
                RETRY_INTERVAL_MS = options.TestDelay,
                MAX_TEST_RUNS = options.TestCount,
                CORRECT_LATENCY = options.CorrectLatency;
                
            // Test result collections
            var timeResults = [],
                latencies = [];
            
            // Function used to run a single test method
            var invokeTest = function(){
                if ((calls < MAX_TEST_RUNS) && (!stopTest)){

                    //
                    // Start and end mark the timestamps (in ms) when our requests
                    // initiate and complete. Latency is computed as noted below 
                    // (i.e., RTT / 2.0)
                    //
                    var start = 0.0,
                        end = 0.0,
                        latency = 0.0;
                    
                    // Make call to get data
                    $.ajax({
                        url: '/Time',
                        beforeSend: function(){
                            // Begin test run: first take time snapshot of our time.
                            start = new Date().getTime();                            
                        },
                        success: function(data){
                            //
                            // Take another snapshot of the current timer now
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
                            if (CORRECT_LATENCY){
                                timeResults.push(Math.abs(start - (data.ServerTime - latency)));
                            } else {
                                timeResults.push(Math.abs(start - data.ServerTime));
                            }
                            
                            // save latency
                            latencies.push(latency);
                            
                            // Invoke callback (if supplied)
                            if (self.OnNextResult){
                                self.OnNextResult({
                                    Latencies : latencies,
                                    Measurements : timeResults
                                });
                            }

                            // Increment call counter
                            calls++;
                            
                            // Fire off again after RETRY delay
                            if (!stopTest){
                                setTimeout(invokeTest, RETRY_INTERVAL_MS);
                            } else {
                                completeTest();
                            }
                        }
                    });
                } else {
                    completeTest();
                }
            };
            
            // Ends a test run, and invokes the completion callback.
            var completeTest = function(){
                calls = 0;
                if (self.OnComplete){
                    self.OnComplete();
                }                
            };
            
            // callback methods
            self.OnNextResult = null;
            self.OnComplete = null;
            
            // starts the checker
            self.Start = function(){
                setTimeout(invokeTest, RETRY_INTERVAL_MS);
            };
            
            // Stops the active run (if any)
            self.Stop = function(){
                stopTest = true;
            };
        };
    }
})(this);