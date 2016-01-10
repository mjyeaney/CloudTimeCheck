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
                RETRY_INTERVAL_MS = (options.TestDelay || 50), 
                calls = 0, 
                MAX_TEST_RUNS = (options.TestCount || 100);
                
            // Test result collections
            var timeResults = [],
                latencies = [];
            
            // Function used to run a single test method
            var invokeTest = function(){
                if (calls < MAX_TEST_RUNS){
                    // TODO: run test here - Mock data for now
                    var start = new Date().getTime();
                    
                    $.ajax({
                        url: '/Time',
                        success: function(data){
                            var end = new Date().getTime();
                            var latency = (end - start) / 2.0;
                            
                            // console.log('Start: ' + start);
                            // console.log('End: ' + end);
                            // console.log('Latency: ' + latency);
                            
                            timeResults.push(start - (data.ServerTime - latency));
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
                            setTimeout(invokeTest, RETRY_INTERVAL_MS); 
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
        };
    }
})(this);