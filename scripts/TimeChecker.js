//
// The core time checker logic itself.
//
// TODO: Need to extract the following dependencies:
//
//      - XHR / Network calls
//      - Timer functions (setInterval/setTimeout)
//

(function(scope){
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
                RETRY_INTERVAL_MS = (options.retryInterval || 50), 
                calls = 0, 
                maxCalls = 100;
                
            // Test result collections
            var timeResults = [],
                latencies = [];
            
            // Function used to run a single test method
            var invokeTest = function(){
                if (calls < maxCalls){
                    // TODO: run test here
                    timeResults.push(Math.random() * 1000.0);
                    latencies.push(Math.random() * 1000.0);
                    
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