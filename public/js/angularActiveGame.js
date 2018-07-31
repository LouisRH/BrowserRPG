var app = angular.module('activeGame', ['ngRoute']);
app.controller('activeGameCtrl', function($scope, $http, $route) {
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
    //$scope.$on('$routeChangeSuccess', function() {
    //$transitions.onSuccess({}, function(transition) {
        var sendData = {
            messageType: "loadPlayer",
            gameID: $route.current.params
        }
        alert(sendData.gameID.gameID);
        $http.post('/game', sendData).then((responseGood) => {
            alert(responseGood.data.name);
            $scope.gamedata = responseGood.data;
        }, (responseBad) => {
            alert(responseBad.data);
        })
   //})
});