var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http, $timeout) {
    $scope.gamedata;
    $scope.currPlayerStats;
    $scope.currEnemyStats;
    $scope.disabled = {
        attack: false,
        defend: false,
        flee: false,
        magic: false,
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
        // Check current MP, send rejection message if not enough / Prevent redundant spellcasting
        if (((action === "fire" || action === "cure") && $scope.currPlayerStats.MP < 5) ||
            ((action === "protect" || action === "deprotect" || action === "shell" || action === "deshell" ||
              action === "bravery" || action === "debrave" || action === "faith" || action === "defaith" ||
              action === "haste" || action === "slow") && $scope.currPlayerStats.MP < 10) ||
            ((action === "regen" || action === "poison") && $scope.currPlayerStats.MP < 15)) {
            $scope.updateLog("Not enough MP!");
        } else if ((action === "protect" && $scope.currPlayerStats.status.def === 1) || 
        (action === "deprotect" && $scope.currEnemyStats.status.def === -1) || 
        (action === "shell" && $scope.currPlayerStats.status.res === 1) || 
        (action === "deshell" && $scope.currEnemyStats.status.res === -1) || 
        (action === "bravery" && $scope.currPlayerStats.status.str === 1) || 
        (action === "debrave" && $scope.currEnemyStats.status.str === -1) || 
        (action === "faith" && $scope.currPlayerStats.status.mag === 1) || 
        (action === "defaith" && $scope.currEnemyStats.status.mag === -1) || 
        (action === "haste" && $scope.currPlayerStats.status.agi === 1) || 
        (action === "slow" && $scope.currEnemyStats.status.agi === -1) || 
        (action === "regen" && $scope.currPlayerStats.status.flux === 1) || 
        (action === "poison" && $scope.currEnemyStats.status.flux === -1)) {
            $scope.updateLog("Status already in effect!");
        } else if (action !== "next") {
            $scope.disabled.attack = true;
            $scope.disabled.defend = true;
            $scope.disabled.flee = true;
            $scope.disabled.magic = true;
            $scope.disabled.next = true;
            sendData = {
                messageType: action,
                currPlayerStats: $scope.currPlayerStats,
                currEnemyStats: $scope.currEnemyStats,
                baseStats: $scope.gamedata.playerData,
                enemyScale: $scope.gamedata.enemyData
            }
            $http.post('/game', sendData).then((responseGood) => {
                // Turn1
                $scope.currPlayerStats = responseGood.data.turn1.currPlayerStats;
                $scope.currEnemyStats = responseGood.data.turn1.currEnemyStats;
                $scope.updateLog(responseGood.data.turn1.message);
                if (responseGood.data.turn1.statusMessage !== "") {
                    $scope.updateLog(responseGood.data.turn1.statusMessage);
                }
                
                // Turn2
                if (responseGood.data.flee === true) {
                    $scope.disabled.next = false;
                    $scope.updateLog("Click 'Next' to continue.");
                } else if (responseGood.data.death === 0) {
                    $scope.currPlayerStats = responseGood.data.turn2.currPlayerStats;
                    $scope.currEnemyStats = responseGood.data.turn2.currEnemyStats;
                    $scope.updateLog(responseGood.data.turn2.message);
                    if (responseGood.data.turn2.statusMessage !== "") {
                        $scope.updateLog(responseGood.data.turn2.statusMessage);
                    }
                    $scope.disabled.attack = false;
                    $scope.disabled.defend = false;
                    $scope.disabled.flee = false;
                    $scope.disabled.magic = false;
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
                $scope.disabled.magic = false;
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
        // For both the player and the enemy, the status json stores information relating to which 
        // buffs and debuffs are currently applied. 0 means the stat is neutral, -1 means the stat is affected by a debuff,
        // and 1 means the stat is affected by a buff.
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
            aiVals: {
                attack: $scope.gamedata.enemyData.aiVals.attack,
                fire: $scope.gamedata.enemyData.aiVals.fire,
                cure: $scope.gamedata.enemyData.aiVals.cure,
                protect: $scope.gamedata.enemyData.aiVals.protect,
                deprotect: $scope.gamedata.enemyData.aiVals.deprotect,
                shell: $scope.gamedata.enemyData.aiVals.shell,
                deshell: $scope.gamedata.enemyData.aiVals.deshell,
                bravery: $scope.gamedata.enemyData.aiVals.bravery,
                debrave: $scope.gamedata.enemyData.aiVals.debrave,
                faith: $scope.gamedata.enemyData.aiVals.faith,
                defaith: $scope.gamedata.enemyData.aiVals.defaith,
                haste: $scope.gamedata.enemyData.aiVals.haste,
                slow: $scope.gamedata.enemyData.aiVals.slow,
                regen: $scope.gamedata.enemyData.aiVals.regen,
                poison: $scope.gamedata.enemyData.aiVals.poison
            },
            status: {
                str: 0,
                mag: 0,
                def: 0,
                res: 0,
                agi: 0,
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
                agi: 0,
                flux: 0
            },
            exp: $scope.gamedata.playerData.exp
        }
        $scope.updateLog($scope.currEnemyStats.name + " approaches!");
    }
});