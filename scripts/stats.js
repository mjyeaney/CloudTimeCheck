//
// This modules contains various distribution methods
// for use by queue simulation routines.
//

(function(scope){
    // Define namespace
    if (!scope.Distributions){
        scope.Distributions = {};
    }

    // Helper to get base-10 log method
    var _log10 = function(n){
        return Math.log(n) / Math.LN10;
    };

    //
    // Creates a uniformly-distributed random variable
    //
    var uniform = function(){
        return Math.random();
    };

    //
    // Creates a Poisson-distributed random variable.
    //
    var poisson = function(lambda){
        return jStat.poisson.sample(lambda);
    };

    //
    // Creates a Gaussian-distributed random varialbe
    //
    var gaussian = function(mu, sigma){
        return jStat.normal.sample(mu, sigma);
    };

    //
    // Creates a log-normal distributed random variable
    //
    var logNormal = function(mu, sigma){
        return jStat.lognormal.sample(mu, sigma);
    };

    //
    // Creates an exponential random variable
    //
    var exponential = function(lambda){
        return jStat.exponential.sample(lambda);
    };

    //
    // Creates a set of bins representing histrogram profile
    //
    var createHistogramBins = function(data){
        var nBins = 0,
            localData = data.slice(0),
            min = 0.0,
            max = 0.0,
            delta = 0.0,
            width = 0.0,
            bins = [],
            uniqueValues = {length: 0};

        // Apply Sturge's method to determin bin counts
        nBins = Math.ceil(Math.log(data.length) / Math.LN2 + 1);

        // Figure out cardinality and sort data
        localData.sort(function(x, y){
            // 
            // Here we're checking for values we have not yet 
            // observed before. This will give is an indication 
            // of the approximate cardinality of the dataset.
            //
            // I may try to substitute a HyperLogLog implementation 
            // to perform cardinality assessment. 
            //
            if (uniqueValues.length <= 25){
                if (!uniqueValues.hasOwnProperty(x)){
                    uniqueValues[x] = x;
                    uniqueValues.length++;
                }

                if (!uniqueValues.hasOwnProperty(y)){
                    uniqueValues[y] = y;
                    uniqueValues.length++;
                }
            }

            // Apply numeric sorting rules
            return x - y;
        });

        // See if we've had a low enough cardinality
        // to consider this a column-frequency chart.
        if (uniqueValues.length <= 25){
            nBins = Math.max(10, uniqueValues.length);
        }

        // Extremeties are now min/max
        min = localData[0];
        max = localData[localData.length - 1];

        // Adding one here since we're counting digits (naive)
        delta = (max - min) + 1;
        width = delta / nBins;

        // Initialize bins
        for (var i = 0; i < nBins; i++){
            bins[i] = ['', 0];
            bins[i][0] = (min + (i * width)).toFixed(2);
        }

        // Find a slot for each datum
        for (var j = 0; j < localData.length; j++){
            var datum = localData[j];

            for (var i = 0; i < nBins; i++){
                var lowerEdge = min + (i * width);
                var upperEdge = lowerEdge + width;

                // Once a slot is found, move on to the next datum
                // (An individual datum cannot exist in more than one slot)
                if (datum >= lowerEdge && datum < upperEdge){
                    bins[i][1]++;
                    break;
                }
            }
        }
        
        // Done!
        return bins;
    };

    // Export methods
    scope.Distributions.Uniform = uniform;
    scope.Distributions.Poisson = poisson;
    scope.Distributions.Gaussian = gaussian;
    scope.Distributions.LogNormal = logNormal;
    scope.Distributions.Exponential = exponential;
    scope.Distributions.Histogram = createHistogramBins;
})(this);
