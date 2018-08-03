var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http, $timeout) {
    $scope.gamedata;
    $scope.currPlayerStats;
    $scope.currEnemyStats;
    var sendData = {
        messageType: "loadPlayer"
    }
    $http.post('/game', sendData).then((responseGood) => {
        $scope.gamedata = responseGood.data;
        $scope.currEnemyStats = {
            name: $scope.gamedata.enemyData.name,
            level: $scope.gamedata.playerData.enemyLevel,
            MaxHP: Math.round($scope.gamedata.playerData.enemyHP * ($scope.gamedata.enemyData.HPScale / 100)),
            MaxMP: Math.round($scope.gamedata.playerData.enemyMP * ($scope.gamedata.enemyData.MPScale / 100)),
            HP: Math.round($scope.gamedata.playerData.enemyHP * ($scope.gamedata.enemyData.HPScale / 100)),
            MP: Math.round($scope.gamedata.playerData.enemyMP * ($scope.gamedata.enemyData.MPScale / 100)),
            str: Math.round($scope.gamedata.playerData.enemyStr * ($scope.gamedata.enemyData.strScale / 100)),
            mag: Math.round($scope.gamedata.playerData.enemyMag * ($scope.gamedata.enemyData.magScale / 100)),
            def: Math.round($scope.gamedata.playerData.enemyDef * ($scope.gamedata.enemyData.defScale / 100)),
            res: Math.round($scope.gamedata.playerData.enemyRes * ($scope.gamedata.enemyData.resScale / 100)),
            agi: Math.round($scope.gamedata.playerData.enemyAgi * ($scope.gamedata.enemyData.agiScale / 100)),
            luck: Math.round($scope.gamedata.playerData.enemyLuck * ($scope.gamedata.enemyData.luckScale / 100)),
            status: {
                str: 0,
                mag: 0,
                def: 0,
                res: 0,
                flux: 0
            }
        }
        $scope.currPlayerStats = {
            name: $scope.gamedata.playerData.name,
            level: $scope.gamedata.playerData.level,
            MaxHP: $scope.gamedata.playerData.HP,
            MaxMP: $scope.gamedata.playerData.MP,
            HP: $scope.gamedata.playerData.HP,
            MP: $scope.gamedata.playerData.MP,
            str: $scope.gamedata.playerData.str,
            mag: $scope.gamedata.playerData.mag,
            def: $scope.gamedata.playerData.def,
            res: $scope.gamedata.playerData.res,
            agi: $scope.gamedata.playerData.agi,
            luck: $scope.gamedata.playerData.luck,
            status: {
                str: 0,
                mag: 0,
                def: 0,
                res: 0,
                flux: 0
            },
            exp: $scope.gamedata.playerData.exp
        }
    }, (responseBad) => {
        alert(responseBad.data);
    });

    $scope.action = function(action) {
        if (action === "attack") {
            //send through post, handle based on action name, calculate damage/stat/status changes
            //return results
            sendData = {
                messageType: "attack",
                currPlayerStats: $scope.currPlayerStats,
                currEnemyStats: $scope.currEnemyStats
            }
            $http.post('/game', sendData).then((responseGood) => {
                // Turn1
                setTimeout(function () {
                    $scope.$apply(function(){
                        $scope.currPlayerStats = responseGood.data.turn1.currPlayerStats;
                        $scope.currEnemyStats = responseGood.data.turn1.currEnemyStats;
                    });
                }, 10);
                
                if (responseGood.data.death === 0) {
                    setTimeout(function () {
                        $scope.$apply(function(){
                            $scope.currPlayerStats = responseGood.data.turn2.currPlayerStats;
                            $scope.currEnemyStats = responseGood.data.turn2.currEnemyStats;
                        });
                    }, 1000);
                    
                    
                }
                // Turn2
            }, (responseBad) => {
                alert(responseBad.data);
            });
        }
    };
});