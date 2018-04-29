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
        ['Year', 'Sales', 'Expenses', 'Profit'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
    ]);

    var options = {
        chart: {
            title: 'Company Performance',
            subtitle: 'Sales, Expenses, and Profit: 2014-2017',
        }
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function generateGraphHistories() {
//select data items to be used randomly

    var transOperationCounter = 0;
    var tSize = [1, 5, 10, 20];
    var dataItems = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'];
    var dSize = [1, 5, 10, 20];
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

            for (var iter = 0; iter < 5; iter++) {
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
    var serialArray = [];
    var serialPercentArr = [];



    for (var tth = 0; tth < array.length; tth++){

        var tempSerial = {
            t: array[tth].transactionNum,
            dSizes: [],

        };

        // for (var t = 1; t <= transactionSize; t++) {
        //     var serialItem = {trans: t, conflicts: []};
        //     serialArray.push(serialItem)
        // }
        var dAICountsArray = array[tth].dataItemCounts;

        for (var di = 0; di < dAICountsArray.length; di++){

            var tempDsize = {
                d: dAICountsArray[di].dataItemSize,
                s: 0
            };

            var historiesArr = dAICountsArray[di].history;

            for (var histories = 0; histories < historiesArr.length; histories++){

            }
        }

    }

    for (var firstOperation = 0; firstOperation < array.length; firstOperation++) {

        if (array[firstOperation].operation === 'a' || array[firstOperation].operation === 'c') {
            continue;
        }

        for (var secondOperation = (firstOperation + 1); secondOperation < array.length; secondOperation++) {

            if (array[firstOperation].transaction === array[secondOperation].transaction) {
                continue;
            }
            else if (array[firstOperation].dataItem !== array[secondOperation].dataItem) {
                continue;
            }
            else if (array[secondOperation].operation === 'a' || array[secondOperation].operation === 'c') {
                continue;
            }
            else if (array[firstOperation].operation === 'w' || array[secondOperation].operation === 'w') {
                var conflictingTransaction = array[secondOperation].transaction;
                serialArray[array[firstOperation].transaction - 1].conflicts.push(conflictingTransaction);
            }
        }
    }

    for (var sItem = 0; sItem < serialArray.length; sItem++) {

        if ($scope.isSerializable === false) {
            break;
        }

        for (var conflict = 0; conflict < serialArray[sItem].conflicts.length; conflict++) {

            if ($scope.isSerializable === false) {
                break;
            }

            var checkSItem = serialArray[sItem].conflicts[conflict] - 1;

            for (var secondConflict = 0; secondConflict < serialArray[checkSItem].conflicts.length; secondConflict++) {
                if (serialArray[checkSItem].conflicts[secondConflict] === serialArray[sItem].trans) {
                    $scope.isSerializable = false;
                    break;
                }
            }
        }
    }
}