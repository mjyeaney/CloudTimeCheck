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
            }
            
            // Apply any options
            var self = this,
                stopTest = false,
                RETRY_INTERVAL_MS = (options.TestDelay || 50), 
                calls = 0, 
                MAX_TEST_RUNS = (options.TestCount || 100),
                CORRECT_LATENCY = (options.CorrectLatency || true);
                
            // Test result collections
            var timeResults = [],
                latencies = [];
            
            // Function used to run a single test method
            var invokeTest = function(){
                if ((calls < MAX_TEST_RUNS) && (!stopTest)){
                    // Begin test run: first take time snapshot
                    var start = new Date().getTime();
                    
                    // Make call to get data
                    $.ajax({
                        url: '/Time',
                        success: function(data){
                            var end = new Date().getTime();
                            var latency = (end - start) / 2.0;
                            
                            // compute/save time delta
                            if (CORRECT_LATENCY){
                                timeResults.push(start - (data.ServerTime - latency));
                            } else {
                                timeResults.push(start - data.ServerTime);
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
                            } 
                        }
                    });
                } else {
                    // Done - reset and stop call chain
                    calls = 0;
                    if (self.OnComplete){
                        self.OnComplete();
                    }
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