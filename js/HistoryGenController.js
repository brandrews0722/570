HistoryApp.controller('HistoryGen', ['$scope', '$window', 'dataItemArr', 'operationsArr', function ($scope, $window, dataItemArr, operationsArr) {
    $scope.tOptions = [1, 2, 3, 4];
    $scope.dOptions = [1, 2, 3, 4];
    $scope.inputs = {tSize: 0, dSize: 0};
    $scope.transactionCommitAborts = [];
    $scope.isSerializable = true;
    $scope.isRecoverable = true;
    $scope.isStrict = true;
    $scope.isACA = true;

    $scope.generate = function (tSize, dSize) {
        $scope.HistoryArr = [];
        var tempDataItemArr = [];
        var transOperationCounter = 0;

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

        for (var transactionNumber = 1; transactionNumber < (tSize + 1); transactionNumber++) {
            for (var historyItem = $scope.HistoryArr.length - 1; historyItem > 0; historyItem--) {
                if ($scope.HistoryArr[historyItem].transaction === transactionNumber) {
                    $scope.HistoryArr[historyItem].operation = operationsArr[Math.floor(Math.random() * 2) + 2];
                    $scope.HistoryArr[historyItem].dataItem = '';
                    break;
                }
            }
        }

        $scope.isSerializable = CheckSerializability($scope.HistoryArr, tSize);
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
            serialArray.push(serialItem);

            for (var firstOperation = 0; firstOperation < array.length; firstOperation++) {

                if (array[firstOperation].transaction != t) {
                    continue;
                }
                else if (array[firstOperation].operation === 'a' || array[firstOperation].operation === 'c') {
                    continue;
                }

                for (var secondOperation = 1; secondOperation < array.length; secondOperation++) {

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
                        serialArray[t - 1].conflicts.push(conflictingTransaction);
                    }
                }
            }
        }

        for (var sItem = 0; sItem < serialArray.length; sItem++) {
            for (var conflict = 0; conflict < serialArray[sItem].conflicts.length; conflict++) {

                var checkSItem = serialArray[sItem].conflicts[conflict] - 1;

                for (var secondConflict = 0; secondConflict < serialArray[checkSItem].conflicts.length; secondConflict++) {
                    if (serialArray[checkSItem].conflicts[secondConflict] === serialArray[sItem].trans) {
                        $scope.isSerializable = false;
                    }
                }
            }
        }
    };

    function analyze(array, tSize) {

        locateCommitAbort(tSize);

        $scope.transactionCommitAborts.sort(function(a, b) {
            return a.t - b.t;
        })

        for (var firstOperation = 0; firstOperation < array.length; firstOperation++) {

            if (array[firstOperation].operation !== 'w'){
                continue;
            }

            var firstObj = array[firstOperation];

            for (var secondOperation = 1; secondOperation < array.length; secondOperation++) {

                var secondObj = array[secondOperation];

                if (secondObj.operation === 'c' || secondObj.operation === 'a'){
                    continue;
                }
                if (firstObj.dataItem === secondObj.dataItem){

                    if (secondObj.operation === 'r' &&
                        (transactionCommitAborts[firstObj.transaction - 1].op !== 'a' &&
                                transactionCommitAborts[firstObj.transaction - 1].index >
                                    transactionCommitAborts[secondObj.transaction - 1].index)){
                        $scope.isACA = false;
                        $scope.isStrict = false;
                    }

                    if (secondObj.operation === 'r' &&
                            (transactionCommitAborts[secondObj.transaction - 1].op === 'c' &&
                                transactionCommitAborts[firstObj.transaction - 1].index >
                                transactionCommitAborts[secondObj.transaction - 1].index)){
                        $scope.isRecoverable = false;
                    }

                    if (transactionCommitAborts[firstObj.transaction - 1].op !== 'a' &&
                            transactionCommitAborts[firstObj.transaction - 1].index >
                            transactionCommitAborts[secondObj.transaction - 1].index){
                        $scope.isStrict = false;
                    }
                }
            }
        }
    };

    function locateCommitAbort(tSize){
        while (tSize !== 0) {
            for (var operation = $scope.HistoryArr.length - 1; operation > 0; operation--) {
                if ($scope.HistoryArr[operation].operation === 'c' || $scope.HistoryArr[operation].operation === 'a'){
                    var tempCA = {
                        t: $scope.HistoryArr[operation].transaction,
                        index: operation,
                        op: $scope.HistoryArr[operation].operation
                    };
                    $scope.transactionCommitAborts.push(tempCA);
                }
            }
        }
    }
}]);