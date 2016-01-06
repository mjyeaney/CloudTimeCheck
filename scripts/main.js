//
// Main controller module for Qsim.
//

$(function(){
 
    //
    // Initialize  charts placeholders (initial)
    //
    var e1 = $('#arrivalsGraph'),
        c1 = _createGraph(e1, 'line', 'Arrival Rate', []);
    
    var e2 = $('#arrivalsHistogram'),
        c2 = _createGraph(e2, 'column', 'Arrival Rate - Histogram', []);

    var e3 = $('#queueLengthGraph'),
        c3 = _createGraph(e3, 'line', 'Queue Length', []);
    
    var e4 = $('#queueLengthHistogram'),
        c4 = _createGraph(e4, 'column', 'Queue Length - Histogram', []);

    var e5 = $('#waitTimesGraph'),
        c5 = _createGraph(e5, 'line', 'Wait Time', []);

    var e6 = $('#waitTimesHistogram'),
        c6 = _createGraph(e6, 'column', 'Wait Time - Histogram', []);
    
    var e7 = $('#utilizationGraph'),
        c7 = _createGraph(e7, 'line', 'Utilization', []);

    var e8 = $('#utilizationHistogram'),
        c8 = _createGraph(e8, 'column', 'Utilization - Histogram', []);

    var e9 = $('#processingGraph'),
        c9 = _createGraph(e9, 'line', 'Processing Rate', []);
 
    var e10 = $('#processingHistogram'),
        c10 = _createGraph(e10, 'column', 'Processing Rate - Histogram', []);
        
    var e11 = $('#loadShedGraph'),
        c11 = _createGraph(e11, 'line', 'Load-Shed Items', []);
        
    var e12 = $('#loadShedHistogram'),
        c12 = _createGraph(e12, 'column', 'Load-Shed Items - Histogram', []);

    //
    // Start simulation loop when user clicks 'run' button.
    //
    $('#btnRun').click(function(){
        // Reset our environment and update DOM state
        $('#results').removeClass('inactive').addClass('active');
        $(this).text($(this).data('busy-text'));
        
        // TODO: Wrap in an async-delegate signature
        setTimeout(function(){
            Queueing.Reset();
            _bindFormToModel();
                
            while (true){
                if (Queueing.GetTicks() <= Queueing.Options.simulationTime){
                    Queueing.OnTick();
                } else {
                    if (Queueing.Options.enableDrainOff){
                        Queueing.EnableDrainOff();
                        while (Queueing.GetWorkItemCount() > 0){
                            Queueing.OnTick();
                        }
                    }
                    
                    // Done!
                    break;
                }
            }
            
            $('#btnRun').text($('#btnRun').data('idle-text'));
            _updateGraphData();
            _updateSummaryStats();
        }, 50);
    });

    //
    // Setup the initial page view state.
    //
    $('#results').addClass('inactive');
    $('#txtRngSeed').val('123456').focus();

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

    // Binds parameter input form to model
    function _bindFormToModel(){
        var params = {};
        params.simulationTime = parseInt($('#txtSimulationTime').val());
        params.arrivalDistribution = $('#lstArrivalDist').val();
        params.arrivalRate = parseFloat($('#txtArrivalRate').val());
        params.serverCount = parseInt($('#txtServerCount').val());
        params.processingDistribution = $('#lstProcessingDist').val();
        params.processingRate = parseFloat($('#txtProcessingRate').val());
        params.randomSeed = parseInt($('#txtRngSeed').val());
        params.enableQos = $('#cbApplyQoS').prop('checked');
        params.enableLoadShed = $('#cbApplyLoadShed').prop('checked');
        params.enableDrainOff = $('#cbEnableDrainOff').prop('checked');
        params.taskTimeout = 30;
        Queueing.Initialize(params);
    };

    // Helper to rebind charts to new data sources
    function _updateGraphData(){
        var arrivals = Queueing.Arrivals.slice(0);
        var arrivalHist = Distributions.Histogram(arrivals);
        c1.highcharts().series[0].setData(arrivals);
        c2.highcharts().series[0].setData(arrivalHist);

        var queueLengths = Queueing.QueueLengths.slice(0);
        var queueLengthHist = Distributions.Histogram(queueLengths);
        c3.highcharts().series[0].setData(queueLengths);
        c4.highcharts().series[0].setData(queueLengthHist);

        var waitTimes = Queueing.WaitTimes.slice(0);
        var waitTimeHist = Distributions.Histogram(waitTimes);
        c5.highcharts().series[0].setData(waitTimes);
        c6.highcharts().series[0].setData(waitTimeHist);
        
        var loadShedCounts = Queueing.LoadShedCounts.slice(0);
        var loadShedHist = Distributions.Histogram(loadShedCounts);
        c11.highcharts().series[0].setData(loadShedCounts);
        c12.highcharts().series[0].setData(loadShedHist);

        var utilization = Queueing.Utilization.slice(0);
        var utilizationHist = Distributions.Histogram(utilization);
        c7.highcharts().series[0].setData(utilization);
        c8.highcharts().series[0].setData(utilizationHist);

        var processing = Queueing.ProcessingTimes.slice(0);
        var processingHist = Distributions.Histogram(processing);
        c9.highcharts().series[0].setData(processing);
        c10.highcharts().series[0].setData(processingHist);
    };

    // Updates the summary statistics 
    function _updateSummaryStats(){
        $('#txtTasksCompleted').text(Queueing.Arrivals.Sum());
        $('#txtAvgQueueLength').text(Queueing.QueueLengths.Avg().toFixed(2));
        $('#txtAvgWaitTime').text(Queueing.WaitTimes.Avg().toFixed(2));
        $('#txtAvgUtilization').text(Queueing.Utilization.Avg().toFixed(2));
        $('#txtAvgProcTime').text(Queueing.ProcessingTimes.Avg().toFixed(2));
    };

    // Clears summary stats
    function _clearSummaryStats(){
        $('#txtTasksCompleted').text('');
        $('#txtAvgQueueLength').text('');
        $('#txtAvgWaitTime').text('');
        $('#txtAvgUtilization').text('');
        $('#txtAvgProcTime').text('');
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
