var app = angular.module('charCreate', []);
app.controller('charCreateCtrl', function($scope, $http, $window) {
    $scope.bonus = 10;
    $scope.gamedata = {
        name: "",
        bonusHP: 0,
        bonusMP: 0,
        bonusStr: 0,
        bonusMag: 0,
        bonusDef: 0,
        bonusRes: 0,
        bonusAgi: 0,
        bonusLuck: 0
    };

    $scope.operator = "";

    $scope.minus = function(stat) {
        if (stat === "hp") {
            if ($scope.gamedata.bonusHP > 0) {
                $scope.gamedata.bonusHP--;
                $scope.bonus++;
            }
        } else if (stat === "mp") {
            if ($scope.gamedata.bonusMP > 0) {
                $scope.gamedata.bonusMP--;
                $scope.bonus++;
            }
        } else if (stat === "str") {
            if ($scope.gamedata.bonusStr > 0) {
                $scope.gamedata.bonusStr--;
                $scope.bonus++;
            }
        } else if (stat === "mag") {
            if ($scope.gamedata.bonusMag > 0) {
                $scope.gamedata.bonusMag--;
                $scope.bonus++;
            }
        } else if (stat === "def") {
            if ($scope.gamedata.bonusDef > 0) {
                $scope.gamedata.bonusDef--;
                $scope.bonus++;
            }
        } else if (stat === "res") {
            if ($scope.gamedata.bonusRes > 0) {
                $scope.gamedata.bonusRes--;
                $scope.bonus++;
            }
        } else if (stat === "agi") {
            if ($scope.gamedata.bonusAgi > 0) {
                $scope.gamedata.bonusAgi--;
                $scope.bonus++;
            }
        } else if (stat === "luck") {
            if ($scope.gamedata.bonusLuck > 0) {
                $scope.gamedata.bonusLuck--;
                $scope.bonus++;
            }
        }
    };

    $scope.plus = function(stat) {
        if (stat === "hp") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusHP++;
                $scope.bonus--;
            }
        } else if (stat === "mp") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusMP++;
                $scope.bonus--;
            }
        } else if (stat === "str") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusStr++;
                $scope.bonus--;
            }
        } else if (stat === "mag") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusMag++;
                $scope.bonus--;
            }
        } else if (stat === "def") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusDef++;
                $scope.bonus--;
            }
        } else if (stat === "res") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusRes++;
                $scope.bonus--;
            }
        } else if (stat === "agi") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusAgi++;
                $scope.bonus--;
            }
        } else if (stat === "luck") {
            if ($scope.bonus > 0) {
                $scope.gamedata.bonusLuck++;
                $scope.bonus--;
            }
        }
    }

    $scope.submit = function() {
        var url = "http://" + $window.location.host + "/game";
        $http.post('/game', $scope.gamedata).then((responseGood) => {
            alert(responseGood.data.bonusAgi);
        }, (responseBad) => {
            alert("Whoops");
        });
        $window.location.href = url;
    }
});