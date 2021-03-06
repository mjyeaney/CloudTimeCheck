/* global $, Estimator */

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
                options.TestDelay = 10;
                options.TestCount = 200;
            }
            
            // Estimation algorithm
            var est = new Estimator();
            
            // Local scope and control flags
            var self = this,
                stopTest = false,
                testCount = 0;
                
            // Test result collections and tracking flags
            var webServerDeltas = [],
                latencies = [],
                storageDeltas = [],
                storageLatencies = [],
                start = 0.0;
            
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
                // While not perfect, informal testing shows this agrees with 
                // the Chrome developer tools latency measurement, so we're definitely
                // within the ballpark.
                //
                var end = new Date().getTime();
                var clientOffset = est.ComputeOffset(start, end, data.ServerTime);
                var offset = est.ComposeOffsets(clientOffset, data);
                                
                // compute/save time delta (check options for corrections)
                webServerDeltas.push(offset.Skew);
                
                // save latency reading and storage delta
                storageDeltas.push(data.Skew);
                storageLatencies.push(data.Latency);
                latencies.push(offset.Latency);
                
                // Increment call count
                testCount++;
                
                // Invoke callback (if supplied)
                if (self.OnNextResult){
                    self.OnNextResult({
                        Latencies : latencies,
                        WebserverDeltas : webServerDeltas,
                        StorageDeltas : storageDeltas,
                        StorageLatencies : storageLatencies,
                        TestRunCount : testCount
                    });
                }
                
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