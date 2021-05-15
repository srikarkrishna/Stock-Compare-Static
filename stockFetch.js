let stockMap = new Map();

const newStockDetails = async (e) => {
    const response = await fetch('https://cloud.iexapis.com/stable/stock/' + e + '/quote?token=sk_3232d790b209424391a56f692dfc683b');
    if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
    } else if (response.status === 404) {
        return Promise.reject('error 404. Company not found');
    }

}

const fiveSecondCheck = async () => {
    for (var stockKey in stockMap) {
        var stockData = await newStockDetails(stockKey);
        stockMap[stockKey] = stockData.latestPrice;
    }
    loadChart();
    setTimeout(fiveSecondCheck, 5000);
}

function stockAdded(e) {
    newStockDetails(e).then((value) => {
        if (stockMap[value.symbol] == null) {
            document.getElementById('companiesPicked').innerHTML += '<li>' + value.symbol + '</li>';
        }
        stockMap[value.symbol] = value.latestPrice;
        fiveSecondCheck();
        loadChart();
        document.getElementById('sName').value = '';
        document.getElementById('errorLabel').innerHTML = '';
    }).catch(error => {
        document.getElementById('sName').value = '';
        document.getElementById('errorLabel').innerHTML = 'Enter a valid company';
        console.log(error);
    });
}

function loadChart() {
    google.charts.load('current', {
        packages: ['corechart', 'bar']
    });
    google.charts.setOnLoadCallback(drawStockChart);
}

function drawStockChart() {
    stockArray = [];
    stockArray.push(['Company', 'Stock Price']);
    for (var key in stockMap) {
        stockArray.push([key, stockMap[key]]);
    }
    var data = google.visualization.arrayToDataTable(stockArray);
    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
        {
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        }
    ]);
    var options = {
        title: 'Stock price comparison',
        chartArea: {
            width: '50%'
        },
        hAxis: {
            title: 'Stock Price',
            minValue: 0,
            textStyle: {
                bold: true,
                fontSize: 12,
                color: '#4d4d4d'
            },
            titleTextStyle: {
                bold: true,
                fontSize: 14,
                color: '#848484'
            }
        },
        vAxis: {
            title: 'Company',
            textStyle: {
                fontSize: 12,
                bold: true,
                color: '#4d4d4d'
            },
            titleTextStyle: {
                fontSize: 14,
                bold: true,
                color: '#848484'
            }
        }
    };
    var chart = new google.visualization.BarChart(document.getElementById('stockChart'));
    chart.draw(view, options);
}