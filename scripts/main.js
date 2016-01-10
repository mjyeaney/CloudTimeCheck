/* global $, Distributions, TimeChecker */

//
// Main controller module for Qsim.
//

$(function(){
    //
    // Some more functional array extensions
    //
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
        setTimeout(fn, 50);
    };
    
    //
    // Initialize charts placeholders (initial)
    //
    var e1 = $('#deltaGraph'),
        c1 = _createGraph(e1, 'line', 'Time Deltas (ms)', []);
    
    var e2 = $('#deltaHistogram'),
        c2 = _createGraph(e2, 'column', 'Time Deltas (ms) - Histogram', []);
 
    //
    // Start simulation loop when user clicks 'run' button.
    //
    $('#btnRun').click(function(){
        // Reset our environment and update visible DOM state
        $('#results').removeClass('inactive').addClass('active');
        $(this).text($(this).data('busy-text'));
        
        // Defer the invocation of the test method(s)
        asyncInvoke(function(){
            var test = new TimeChecker();
            test.OnNextResult = function(results){
                // Update progress info
                _updateGraphData(results);
            };
            test.OnComplete = function(){
                // All done!
                $('#btnRun').text($('#btnRun').data('idle-text'));
            };
            test.Start();
        });
    });

    //
    // Setup the initial page view state.
    //
    $('#results').addClass('inactive');

    // // Binds parameter input form to model
    // function _bindFormToModel(){
    //     var params = {};
    //     // TODO: 
    // };

    // Helper to rebind charts to new data sources
    function _updateGraphData(data){
        var histData = Distributions.Histogram(data);
        c1.highcharts().series[0].setData(data);
        c2.highcharts().series[0].setData(histData);
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
