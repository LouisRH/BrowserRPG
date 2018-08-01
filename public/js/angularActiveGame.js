var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http) {
    $scope.gamedata = {
        name: "",
        HP: 0,
        MP: 0,
        str: 0,
        mag: 0,
        def: 0,
        res: 0,
        agi: 0,
        luck: 0
    };
    var sendData = {
        messageType: "loadPlayer"
    }
    $http.post('/game', sendData).then((responseGood) => {
        $scope.gamedata = responseGood.data;
    }, (responseBad) => {
        alert(responseBad.data);
    })
});