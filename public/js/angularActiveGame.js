var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http) {
    $scope.gamedata;
    $scope.currEnemyStats;
    var sendData = {
        messageType: "loadPlayer"
    }
    $http.post('/game', sendData).then((responseGood) => {
        $scope.gamedata = responseGood.data;
        $scope.currEnemyStats = {
            level: $scope.gamedata.playerData.enemyLevel,
            HP: Math.round($scope.gamedata.playerData.enemyHP * ($scope.gamedata.enemyData.HPScale / 100)),
            MP: Math.round($scope.gamedata.playerData.enemyMP * ($scope.gamedata.enemyData.MPScale / 100)),
            str: Math.round($scope.gamedata.playerData.enemyStr * ($scope.gamedata.enemyData.strScale / 100)),
            mag: Math.round($scope.gamedata.playerData.enemyMag * ($scope.gamedata.enemyData.magScale / 100)),
            def: Math.round($scope.gamedata.playerData.enemyDef * ($scope.gamedata.enemyData.defScale / 100)),
            res: Math.round($scope.gamedata.playerData.enemyRes * ($scope.gamedata.enemyData.resScale / 100)),
            agi: Math.round($scope.gamedata.playerData.enemyAgi * ($scope.gamedata.enemyData.agiScale / 100)),
            luck: Math.round($scope.gamedata.playerData.enemyLuck * ($scope.gamedata.enemyData.luckScale / 100))
        }
    }, (responseBad) => {
        alert(responseBad.data);
    });

    $scope.action = function(action) {
        if (action === "attack") {
            //assign current player and enemy stats, max hp and mp, and statuses
            //send through post, handle based on action name, calculate damage/stat/status changes
            //return results
        }
    };
});