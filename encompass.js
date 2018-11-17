"use strict";
import calendar from './mock_calendar.js'

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);
let showAll = true;
function drawChart() {
    let data = new google.visualization.DataTable();
    data.addColumn('number', 'Days');
    data.addColumn('number', 'kWh Consumed');
    data.addColumn('number', 'kWh Generated');
    data.addColumn('number', 'Net kWh');
    let rows = processCalendarData(calendar.data);
    data.addRows(rows);
    var options = {
        width: $(window).width(),
        height: $(window).height()*0.75,
        axes: { x: { 0: {side: 'top'} } },
        animation:{
        duration: 500,
        easing: 'out',
        startup: true
        },
        hAxis : { 
            title: "Days",
            viewWindow : { max : 31, min : 1},
            ticks: data.getDistinctValues(0)
        },
        explorer: { 
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 4.0
        },
        legend : { textStyle : { fontSize : 15 }}
    };
    let chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    google.visualization.events.addListener(chart, 'onmouseover', () => $('#chart_div').css('cursor','pointer'));
    google.visualization.events.addListener(chart, 'onmouseout', () => $('#chart_div').css('cursor','default'));
    google.visualization.events.addListener(chart, 'select', () => {
        if(!chart.getSelection()[0].row)
        {
            if(showAll)
            {
                let columns = [1,2,3];
                columns.splice([chart.getSelection()[0].column]-1,1);
                let view = new google.visualization.DataView(data);
                for(let i of columns)
                    view.hideColumns([i]); 
                chart.draw(view, options);
            }
            else
            {
                drawChart();
            }
            showAll=!showAll
        }
    });
}

function processCalendarData(calendarData) {
    //list is preordered, but sorting by time for good measure
    let processedData = [];
    calendarData.sort((a,b)=>{ return a.Start_Time_Stamp_UTC_ms - b.Start_Time_Stamp_UTC_ms});
    for(let i in calendarData)
    {
        let data = calendarData[i];
        let day = parseInt(i) + 1;
        let kWh_consumed = data.kWh_Tot_Diff;
        let kWh_generated = data.Rev_kWh_Tot_Diff;
        let net_kWh = kWh_consumed - kWh_generated;
        processedData.push([day,kWh_consumed,kWh_generated,net_kWh])
    }
    return processedData;
}

let resizeId;
$(window).resize( () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 200);
});
function doneResizing(){
    if(showAll)
        drawChart();
}