HistoryApp.controller('HistoryGen', ['$scope', '$window', 'dataItemArr', 'operationsArr', function ($scope, $window, dataItemArr, operationsArr) {
    $scope.tOptions = [1, 2, 3, 4, 'Test_NotRC', 'TestRC', 'TestACA', 'TestST'];
    $scope.dOptions = [1, 2, 3, 4];
    $scope.inputs = {tSize: 0, dSize: 0};

    $scope.generate = function (tSize, dSize) {
        $scope.transactionCommitAborts = [];
        $scope.isSerializable = true;
        $scope.isRecoverable = true;
        $scope.isStrict = true;
        $scope.isACA = true;
        $scope.reasonSerial = 'N/A';
        $scope.reasonRecoverable = 'N/A';
        $scope.reasonStrict = 'N/A';
        $scope.reasonACA = 'N/A';
        $scope.HistoryArr = [];
        $scope.commitAllBool = document.getElementById("check").checked;
        var tempDataItemArr = [];
        var transOperationCounter = 0;

        if ($scope.commitAllBool === true){
            tSize = 2;
        }

        if (tSize === 'Test_NotRC'){
            $scope.HistoryArr = [{transaction: 1,operation: 'w',dataItem: 'x'},{transaction: 1,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'r',dataItem: 'u'},{transaction: 2,operation: 'w',dataItem: 'x'},{transaction: 2,operation: 'r',dataItem: 'y'},{transaction: 2,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'c',dataItem: ''},{transaction: 1,operation: 'w',dataItem: 'z'},{transaction: 1,operation: 'c',dataItem: ''}];
            tSize = 2;
        }
        else if (tSize === 'TestRC'){
            $scope.HistoryArr = [{transaction: 1,operation: 'w',dataItem: 'x'},{transaction: 1,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'r',dataItem: 'u'},{transaction: 2,operation: 'w',dataItem: 'x'},{transaction: 2,operation: 'r',dataItem: 'y'},{transaction: 2,operation: 'w',dataItem: 'y'},{transaction: 1,operation: 'w',dataItem: 'z'},{transaction: 1,operation: 'c',dataItem: ''},{transaction: 2,operation: 'c',dataItem: ''}];
            tSize = 2;
        }
        else if (tSize === 'TestACA'){
            $scope.HistoryArr = [{transaction: 1,operation: 'w',dataItem: 'x'},{transaction: 1,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'r',dataItem: 'u'},{transaction: 2,operation: 'w',dataItem: 'x'},{transaction: 1,operation: 'w',dataItem: 'z'},{transaction: 1,operation: 'c',dataItem: ''},{transaction: 2,operation: 'r',dataItem: 'y'},{transaction: 2,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'c',dataItem: ''}];
            tSize = 2;
        }
        else if (tSize === 'TestST'){
            $scope.HistoryArr = [{transaction: 1,operation: 'w',dataItem: 'x'},{transaction: 1,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'r',dataItem: 'u'},{transaction: 1,operation: 'w',dataItem: 'z'},{transaction: 1,operation: 'c',dataItem: ''},{transaction: 2,operation: 'w',dataItem: 'x'},{transaction: 2,operation: 'r',dataItem: 'y'},{transaction: 2,operation: 'w',dataItem: 'y'},{transaction: 2,operation: 'c',dataItem: ''}];
            tSize = 2;
        }
        else {

            //select data items to be used randomly
            for (var di = 0; di < dSize; di++) {
                tempDataItemArr.push(dataItemArr[di]);
            }

            var tempDataItemCount = tempDataItemArr.length;

            //create the random transactions
            for (var t = 0; t < tSize; t++) {
                while (transOperationCounter < 6) {
                    var tempTransactionItem = {
                        transaction: t + 1,
                        operation: '',
                        dataItem: ''
                    };
                    tempTransactionItem.operation = operationsArr[Math.round(Math.random())]; //selects read or write
                    tempTransactionItem.dataItem = tempDataItemArr[Math.floor(Math.random() * tempDataItemCount)];
                    $scope.HistoryArr.push(tempTransactionItem);
                    ++transOperationCounter;
                }
                transOperationCounter = 0;
            }

            shuffle($scope.HistoryArr);

            if ($scope.commitAllBool === true) {
                var firstTransactionToCommit = Math.round(Math.random()) + 1;

                $scope.HistoryArr.push({transaction: firstTransactionToCommit, operation: 'c', dataItem: ''});
                if (firstTransactionToCommit === 1) {
                    $scope.HistoryArr.push({transaction: 2, operation: 'c', dataItem: ''});
                }
                else {
                    $scope.HistoryArr.push({transaction: 1, operation: 'c', dataItem: ''});
                }
            }
            else {
                for (var transactionNumber = 1; transactionNumber < (tSize + 1); transactionNumber++) {
                    for (var historyItem = $scope.HistoryArr.length - 1; historyItem > 0; historyItem--) {
                        if ($scope.HistoryArr[historyItem].transaction === transactionNumber) {
                            $scope.HistoryArr[historyItem].operation = operationsArr[Math.floor(Math.random() * 2) + 2];
                            $scope.HistoryArr[historyItem].dataItem = '';
                            break;
                        }
                    }
                }
            }
        }

        CheckSerializability($scope.HistoryArr, tSize);
        analyze($scope.HistoryArr, tSize);
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

    function CheckSerializability(array, transactionSize) {
        var serialArray = [];

        for (var t = 1; t <= transactionSize; t++) {
            var serialItem = {trans: t, conflicts: []};
            serialArray.push(serialItem)
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
                    var conflictingTransaction = {t: array[secondOperation].transaction, d: array[secondOperation].dataItem};
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

                var checkSItem = serialArray[sItem].conflicts[conflict].t - 1;

                for (var secondConflict = 0; secondConflict < serialArray[checkSItem].conflicts.length; secondConflict++) {
                    if (serialArray[checkSItem].conflicts[secondConflict].t === serialArray[sItem].trans) {
                        $scope.isSerializable = false;
                        $scope.reasonSerial = 'T' + serialArray[checkSItem].trans + ' conflicts with T' + serialArray[sItem].trans +
                            ' on data item "' + serialArray[checkSItem].conflicts[secondConflict].d + '".';
                        break;
                    }
                }
            }
        }
    }



function analyze(array, tSize) {

    locateCommitAbort(tSize);

    $scope.transactionCommitAborts.sort(function (a, b) {
        return a.t - b.t;
    })

    for (var firstOperation = 0; firstOperation < array.length; firstOperation++) {

        if (array[firstOperation].operation !== 'w') {
            continue;
        }

        var firstObj = array[firstOperation];

        for (var secondOperation = firstOperation + 1; secondOperation < array.length; secondOperation++) {

            var secondObj = array[secondOperation];

            if (secondObj.operation === 'c' || secondObj.operation === 'a') {
                continue;
            }
            if (firstObj.dataItem === secondObj.dataItem) {

                if ($scope.transactionCommitAborts[firstObj.transaction - 1].op === 'a' &&
                    $scope.transactionCommitAborts[secondObj.transaction - 1].op === 'a' &&
                    $scope.transactionCommitAborts[firstObj.transaction - 1].index >
                    $scope.transactionCommitAborts[secondObj.transaction - 1].index){
                    $scope.isRecoverable = false;
                    $scope.reasonRecoverable = 'Both T' + firstObj.transaction + ' and T' + secondObj.transaction +
                        ' and the dependent transaction aborts last.';
                }

                if (secondObj.operation === 'r' &&
                    ($scope.transactionCommitAborts[firstObj.transaction - 1].op !== 'a' &&
                        $scope.transactionCommitAborts[firstObj.transaction - 1].index > secondOperation)) {
                    $scope.isACA = false;
                    $scope.isStrict = false;
                    $scope.reasonACA = 'T' + firstObj.transaction + ', the independent transaction, aborts or commits' +
                        ' after the read of the dependent transaction, T' + secondObj.transaction + '.';
                    $scope.reasonStrict = 'T' + firstObj.transaction + ', the independent transaction, aborts or commits' +
                    ' after the read of the dependent transaction, T' + secondObj.transaction + '.';
                }

                if (secondObj.operation === 'r' &&
                    ($scope.transactionCommitAborts[secondObj.transaction - 1].op === 'c' &&
                        $scope.transactionCommitAborts[firstObj.transaction - 1].index >
                        $scope.transactionCommitAborts[secondObj.transaction - 1].index)) {
                    $scope.isRecoverable = false;
                    $scope.reasonRecoverable = 'T' + firstObj.transaction + ' commits before the dependent' +
                        ' transaction, T' + secondObj.transaction + '.';
                }

                if ($scope.transactionCommitAborts[firstObj.transaction - 1].op !== 'a' &&
                    $scope.transactionCommitAborts[firstObj.transaction - 1].index > secondOperation) {
                    $scope.isStrict = false;
                    $scope.reasonStrict = 'T' + firstObj.transaction + ', the independent transaction, aborts or commits' +
                        ' after the write of the dependent transaction, T' + secondObj.transaction + '.';
                }
            }
        }
    }
};

function locateCommitAbort(tSize) {
    while (tSize !== 0) {
        for (var operation = $scope.HistoryArr.length - 1; operation > 0; operation--) {
            if ($scope.HistoryArr[operation].operation === 'c' || $scope.HistoryArr[operation].operation === 'a') {
                var tempCA = {
                    t: $scope.HistoryArr[operation].transaction,
                    index: operation,
                    op: $scope.HistoryArr[operation].operation
                };
                $scope.transactionCommitAborts.push(tempCA);
                --tSize;
            }
        }
    }
}
}])
;