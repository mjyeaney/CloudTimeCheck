/* global $, Statistics, TimeChecker */

//
// Main controller module for Qsim.
//

$(function(){
    // 
    // Make sure requirements are loaded (TODO: Other ways to do this?)
    //
    if (!TimeChecker){
        throw "Unable to located required type 'TimeChecker'."
    }
    if (!Statistics){
        throw "Unable to located required type 'Statistics'."
    }
        
    //
    // Some functional array extensions
    // TODO: Should we just bring in underscore?
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
    // Initialize charts placeholders (initial)
    //
    var e1 = $('#deltaGraph'),
        c1 = _createGraph(e1, 'line', 'Web Server Delta (ms)', []);
    
    var e2 = $('#deltaHistogram'),
        c2 = _createGraph(e2, 'column', 'Web Server Delta (ms) - Histogram', []);
        
    var e3 = $('#latencyGraph'),
        c3 = _createGraph(e3, 'line', 'Latency (ms)', []);
        
    var e4 = $('#latencyHistogram'),
        c4 = _createGraph(e4, 'column', 'Latency (ms) - Histogram', []);
        
    var e5 = $('#storageDeltaGraph'),
        c5 = _createGraph(e5, 'line', 'Web <-> Storage Delta (ms)', []);
    
    var e6 = $('#storageDeltaHistogram'),
        c6 = _createGraph(e6, 'column', 'Web <-> Storage Delta (ms) - Histogram', []);
        
    //
    // Control flags
    //
    var _testRunning = false,
        _testRunner = null;
 
    //
    // Start simulation loop when user clicks 'run' button.
    //
    $('#btnRun').click(function(){
        if (!_testRunning){
            // Reset our environment and update visible DOM state
            $('#results').removeClass('inactive').addClass('active');
            $(this).text($(this).data('busy-text'));
            _testRunning = true;
            
            // Defer the invocation of the test method(s)
            _asyncInvoke(function(){
                var options = _bindFormToModel();
                _testRunner = new TimeChecker(options);
                
                _testRunner.OnNextResult = function(results){
                    _updateGraphData(results);
                };
                
                _testRunner.OnComplete = function(){
                    $('#btnRun').text($('#btnRun').data('idle-text'));
                    _testRunning = false;
                };
                
                _testRunner.Start();
            });
        } else {
            _testRunner.Stop();
            _testRunning = false;
        }
    });

    //
    // Setup the initial page view state.
    //
    $('#results').addClass('inactive');
    $('#txtTestCount').val('200');
    $('#txtTestDelay').val('10');
    
    //
    // Helper fn to defer exectution
    //
    var _asyncInvoke = function(fn){
        setTimeout(fn, 50);
    };

    // Binds parameter input form to model
    function _bindFormToModel(){
        var params = {};
        params.TestCount = parseInt($('#txtTestCount').val());
        params.TestDelay = parseFloat($('#txtTestDelay').val());
        params.CorrectLatency = $('#cbCorrectLatency').prop('checked');
        return params;
    };

    // Helper to rebind charts to new data sources
    function _updateGraphData(data){
        var measurementHist = Statistics.Histogram(data.Measurements);
        c1.highcharts().series[0].setData(data.Measurements);
        c2.highcharts().series[0].setData(measurementHist);
        
        var latencyHist = Statistics.Histogram(data.Latencies);
        c3.highcharts().series[0].setData(data.Latencies);
        c4.highcharts().series[0].setData(latencyHist);
        
        var storageHist = Statistics.Histogram(data.StorageTimes);
        c5.highcharts().series[0].setData(data.StorageTimes);
        c6.highcharts().series[0].setData(storageHist);
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
                endOnTick: true
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
