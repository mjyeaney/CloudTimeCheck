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
            
            // Apply any options
            var self = this,
                hTimer = null,
                RETRY_INTERVAL_MS = (options.retryInterval || 500), 
                calls = 0, 
                maxCalls = 10;
            
            // Function used to run a single test method
            var invokeTest = function(){
                if (calls < maxCalls){
                    // TODO: run test here
                    if (self.OnNextResult){
                        self.OnNextResult();
                    }
                    calls++;
                    console.log('Calls = ' + calls);
                } else {
                    // Done - stop call chain
                    clearInterval(hTimer);
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
                hTimer = setInterval(function(){
                    invokeTest();
                }, RETRY_INTERVAL_MS);
            };       
        };
    }
})(this);