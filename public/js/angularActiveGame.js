var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http, $timeout) {
    $scope.gamedata;
    $scope.currPlayerStats;
    $scope.currEnemyStats;
    $scope.disabled = {
        attack: false,
        defend: false,
        flee: false,
        next: true
    }
    $scope.playerLevelUp = false;
    $scope.enemyLevelUp = 0;
    $scope.messages = [];
    var sendData = {
        messageType: "loadPlayer"
    }
    $http.post('/game', sendData).then((responseGood) => {
        $scope.gamedata = responseGood.data;
        $scope.updateScreen();
    }, (responseBad) => {
        alert("Error: Page load failed");
    });

    $scope.action = function(action) {
        if (action === "attack" || action === "defend" || action === "flee") {
            $scope.disabled.attack = true;
            $scope.disabled.defend = true;
            $scope.disabled.flee = true;
            $scope.disabled.next = true;
            sendData = {
                messageType: action,
                currPlayerStats: $scope.currPlayerStats,
                currEnemyStats: $scope.currEnemyStats
            }
            $http.post('/game', sendData).then((responseGood) => {
                // Turn1
                $scope.currPlayerStats = responseGood.data.turn1.currPlayerStats;
                $scope.currEnemyStats = responseGood.data.turn1.currEnemyStats;
                $scope.updateLog(responseGood.data.turn1.message);
                
                // Turn2
                if (responseGood.data.death === 0) {
                    $scope.currPlayerStats = responseGood.data.turn2.currPlayerStats;
                    $scope.currEnemyStats = responseGood.data.turn2.currEnemyStats;
                    $scope.updateLog(responseGood.data.turn2.message);
                    $scope.disabled.attack = false;
                    $scope.disabled.defend = false;
                    $scope.disabled.flee = false;
                } else {
                    $scope.disabled.next = false;
                    if (responseGood.data.death === 1) {
                        $scope.updateLog(responseGood.data.turn1.currEnemyStats.name + " defeated!");
                        $scope.enemyLevelUp = 1;
                        if (responseGood.data.levelUp === true) {
                            $scope.updateLog(responseGood.data.turn1.currPlayerStats.name + " leveled up!");
                            $scope.playerLevelUp = true;
                        }
                    } else if (responseGood.data.death === -1) {
                        $scope.updateLog(responseGood.data.turn2.message);
                        $scope.updateLog(responseGood.data.turn1.currPlayerStats.name + " defeated...");
                        $scope.enemyLevelUp = -1;
                    }
                    $scope.updateLog("Click 'Next' to continue.");
                }
            }, (responseBad) => {
                alert("Error: Attack failed");
            });
        } else if (action === "next") {
            $scope.disabled.next = true;
            sendData = {
                messageType: "next",
                playerID: $scope.gamedata.playerData._id,
                playerLevelUp: $scope.playerLevelUp,
                enemyLevelUp: $scope.enemyLevelUp,
                exp: $scope.currPlayerStats.exp
            }
            $http.post('/game', sendData).then((responseGood) => {
                $scope.gamedata = responseGood.data;
                $scope.updateScreen();
                $scope.playerLevelUp = false;
                $scope.enemyLevel = 0;
                $scope.disabled.attack = false;
                $scope.disabled.defend = false;
                $scope.disabled.flee = false;
                $scope.disabled.next = true;
            }, (responseBad) => {
                alert("Error: Next failed");
            })
        }
    };

    $scope.updateLog = function(message) {
        if ($scope.messages.length === 16) {
            $scope.messages.splice(0, 1);
        }
        $scope.messages.push(message);
    };

    $scope.updateScreen = function() {
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
        $scope.updateLog($scope.currEnemyStats.name + " approaches!");
    }
});