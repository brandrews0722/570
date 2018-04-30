// Load the Visualization API and the corechart package.

google.charts.load('current', {'packages': ['corechart', 'bar']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.


function drawChart() {

    var historyArr = generateGraphHistories();
    var dataObj = CheckSerializability(historyArr);
    // Create the data table.
    var data = google.visualization.arrayToDataTable([
        ['Transaction', 'DI(1)', 'DI(5)', 'DI(10)', 'DI(20)', 'DI(40)'],
        [dataObj[0].t.toString(), dataObj[0].dSizes[0].s, dataObj[0].dSizes[1].s, dataObj[0].dSizes[2].s, dataObj[0].dSizes[3].s, dataObj[0].dSizes[4].s],
        [dataObj[1].t.toString(), dataObj[1].dSizes[0].s, dataObj[1].dSizes[1].s, dataObj[1].dSizes[2].s, dataObj[1].dSizes[3].s, dataObj[1].dSizes[4].s],
        [dataObj[2].t.toString(), dataObj[2].dSizes[0].s, dataObj[2].dSizes[1].s, dataObj[2].dSizes[2].s, dataObj[2].dSizes[3].s, dataObj[2].dSizes[4].s],
        [dataObj[3].t.toString(), dataObj[3].dSizes[0].s, dataObj[3].dSizes[1].s, dataObj[3].dSizes[2].s, dataObj[3].dSizes[3].s, dataObj[3].dSizes[4].s]
    ]);

    var options = {
        chart: {
            title: 'Serializability vs Number of Transactions and Data Items'
        },
        vAxis: {
            gridlines: { count: 5 },
            title: '% Serializable',
            ticks: [20, 40, 60, 80, 100]
        },
        hAxis: {
            title: '# of Transactions'
        }
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function generateGraphHistories() {
//select data items to be used randomly

    var transOperationCounter = 0;
    var tSize = [1, 2, 5, 10];
    var dataItems = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t'
        ,'a1','b1','c1','d1','e1','f1','g1','h1','i1','j1','k1','l1','m1','n1','o1','p1','q1','r1','s1','t1'];
    var dSize = [1, 5, 10, 20, 40];
    var operationsArr = ['r', 'w', 'a', 'c'];
    var tempTransactionAndHistoryArr = [];
    //for every transaction size
    for (var t = 0; t < tSize.length; t++) {

        var tempTransactionAndHistory = {
            transactionNum: tSize[t],
            dataItemCounts: []
        };

        for (var d = 0; d < dSize.length; d++) {
            var tempDataItem = {
                dataItemSize: dSize[d],
                history: []
            };

            for (var iter = 0; iter < 1000; iter++) {
                var tempHistory = [];
                //create the random transactions
                for (var t2 = 0; t2 < tSize[t]; t2++) {

                    while (transOperationCounter < 6) {
                        var tempTransactionItem = {
                            transaction: t2 + 1,
                            operation: '',
                            dataItem: '',
                        };
                        tempTransactionItem.operation = operationsArr[Math.round(Math.random())]; //selects read or write
                        tempTransactionItem.dataItem = dataItems[Math.floor(Math.random() * dSize[d])];
                        tempHistory.push(tempTransactionItem);
                        ++transOperationCounter;
                    }

                    transOperationCounter = 0;
                }

                shuffle(tempHistory);

                for (var transactionNumber = 1; transactionNumber < (tSize[t] + 1); transactionNumber++) {
                    for (var historyItem = tempHistory.length - 1; historyItem > 0; historyItem--) {
                        if (tempHistory[historyItem].transaction === transactionNumber) {
                            tempHistory[historyItem].operation = operationsArr[Math.floor(Math.random() * 2) + 2];
                            tempHistory[historyItem].dataItem = '';
                            break;
                        }
                    }
                }

                var iterItem = {
                    i: iter + 1,
                    h: tempHistory
                }

                tempDataItem.history.push(tempHistory);
            }
            //tempDataItem.history.push(tempHistory);
            tempTransactionAndHistory.dataItemCounts.push(tempDataItem);
        }

        tempTransactionAndHistoryArr.push(tempTransactionAndHistory);
    }

    return tempTransactionAndHistoryArr;
};

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

function CheckSerializability(array) {

    var serialPercentArr = [];

    for (var tth = 0; tth < array.length; tth++){

        var tempSerial = {
            t: array[tth].transactionNum,
            dSizes: [],
        };

        var dAICountsArray = array[tth].dataItemCounts;

        for (var di = 0; di < dAICountsArray.length; di++){

            var tempDsize = {
                d: dAICountsArray[di].dataItemSize,
                s: 100
            };

            var historiesArr = dAICountsArray[di].history;

            for (var histories = 0; histories < historiesArr.length; histories++){

                var serialArray = [];

                for (var t = 1; t <= array[tth].transactionNum; t++) {
                    var serialItem = {trans: t, conflicts: []};
                    serialArray.push(serialItem)
                }

                var isSerial = checkSerial(historiesArr[histories]);
                if (isSerial === false){
                    tempDsize.s -= .1;
                }
            }

            tempSerial.dSizes.push(tempDsize);
        }

        serialPercentArr.push(tempSerial);
    }

    return serialPercentArr;

    function checkSerial(histArr) {

        var serialBool = true;

        for (var firstOperation = 0; firstOperation < histArr.length; firstOperation++) {

            if (histArr[firstOperation].operation === 'a' || histArr[firstOperation].operation === 'c') {
                continue;
            }

            for (var secondOperation = (firstOperation + 1); secondOperation < histArr.length; secondOperation++) {


                if (histArr[firstOperation].transaction === histArr[secondOperation].transaction) {
                    continue;
                }
                else if (histArr[firstOperation].dataItem !== histArr[secondOperation].dataItem) {
                    continue;
                }
                else if (histArr[secondOperation].operation === 'a' || histArr[secondOperation].operation === 'c') {
                    continue;
                }
                else if (histArr[firstOperation].operation === 'w' || histArr[secondOperation].operation === 'w') {
                    var conflictingTransaction = histArr[secondOperation].transaction;
                    serialArray[histArr[firstOperation].transaction - 1].conflicts.push(conflictingTransaction);
                }
            }
        }

        for (var sItem = 0; sItem < serialArray.length; sItem++) {

            for (var conflict = 0; conflict < serialArray[sItem].conflicts.length; conflict++) {

                if (serialBool === false){
                    return serialBool;
                }

                var checkSItem = serialArray[sItem].conflicts[conflict] - 1;

                for (var secondConflict = 0; secondConflict < serialArray[checkSItem].conflicts.length; secondConflict++) {
                    if (serialArray[checkSItem].conflicts[secondConflict] === serialArray[sItem].trans) {
                        serialBool = false;
                        break;
                    }
                }
            }
        }

        return serialBool;
    }
}