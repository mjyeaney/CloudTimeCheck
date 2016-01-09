//
// Main controller module for Qsim.
//

$(function(){

    // Some more functional array extensions
    Array.prototype.Avg = function(){
        var sum = 0.0;
        for (var i = 0; i < this.length; i++){
            sum += this[i];
        }
        return sum / this.length
    };

    Array.prototype.Sum = function(){
        var sum = 0.0;
        for (var i = 0; i < this.length; i++){
            sum += this[i];
        }
        return sum;
    };
    
    //
    // Helper fn to defer exectution
    //
    var asyncInvoke = function(fn){
        setTimeout(function(){
            fn();
        }, 50);
    }
 
    //
    // Start simulation loop when user clicks 'run' button.
    //
    $('#btnRun').click(function(){
        // Reset our environment and update visible DOM state
        $(this).text($(this).data('busy-text'));
        
        // Defer the invocation of the test method(s)
        asyncInvoke(function(){
            var test = new TimeChecker();
            test.OnNextResult = function(err, result){
                if (err){
                    // Oops..boom.
                } else {
                    // Update progress info
                    console.log('1');
                }
            };
            test.OnComplete = function(){
                // All done!
                console.log('2');
                $('#btnRun').text($('#btnRun').data('idle-text'));
            };
            test.Start();
        });
    });

    //
    // Setup the initial page view state.
    //
    $('#results').addClass('inactive');

    // Binds parameter input form to model
    function _bindFormToModel(){
        var params = {};
        // TODO: 
    };

    // Helper to rebind charts to new data sources
    function _updateGraphData(){
//         var arrivals = Queueing.Arrivals.slice(0);
//         var arrivalHist = Distributions.Histogram(arrivals);
//         c1.highcharts().series[0].setData(arrivals);
//         c2.highcharts().series[0].setData(arrivalHist);
// 
//         var queueLengths = Queueing.QueueLengths.slice(0);
//         var queueLengthHist = Distributions.Histogram(queueLengths);
//         c3.highcharts().series[0].setData(queueLengths);
//         c4.highcharts().series[0].setData(queueLengthHist);
// 
//         var waitTimes = Queueing.WaitTimes.slice(0);
//         var waitTimeHist = Distributions.Histogram(waitTimes);
//         c5.highcharts().series[0].setData(waitTimes);
//         c6.highcharts().series[0].setData(waitTimeHist);
//         
//         var loadShedCounts = Queueing.LoadShedCounts.slice(0);
//         var loadShedHist = Distributions.Histogram(loadShedCounts);
//         c11.highcharts().series[0].setData(loadShedCounts);
//         c12.highcharts().series[0].setData(loadShedHist);
// 
//         var utilization = Queueing.Utilization.slice(0);
//         var utilizationHist = Distributions.Histogram(utilization);
//         c7.highcharts().series[0].setData(utilization);
//         c8.highcharts().series[0].setData(utilizationHist);
// 
//         var processing = Queueing.ProcessingTimes.slice(0);
//         var processingHist = Distributions.Histogram(processing);
//         c9.highcharts().series[0].setData(processing);
//         c10.highcharts().series[0].setData(processingHist);
    };

    // Helper method to setup chart display
    function _createGraph(elm, type, titleText, initData){
        var options = {
            chart: {
                animation: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: titleText,
                align: 'center',
                style: { "color": "#333333", "fontSize": "13px" }
            },
            plotOptions: {
                column: {
                    shadow: false
                },
                spline: {
                    shadow: false,
                    marker: {
                        radius: 1
                    }
                },
                series: {
                    enableMouseTracking: false
                }
            },
            xAxis: {
                gridLineWidth: 1,
                type: 'linear'
            },
            yAxis: {
                title: {
                    text: '' 
                },
                endOnTick: true,
                min: 0
            },
            legend: {
                enabled: false 
            },
            series: [{
                type: type,
                color: 'rgb(125, 167, 217)',
                animation: false,
                name: titleText,
                pointPadding: 0,
                groupPadding: 0,
                data: initData
            }]
        };
        if (type === 'column'){
            options.xAxis.type = 'category';
        }
        return elm.highcharts(options);
    };
});
