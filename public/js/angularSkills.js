var app = angular.module('skills', ['ngRoute']);
app.controller('skillsCtrl', function($scope, $http, $window) {
    $scope.playerData;
    $scope.object = {
        description: "",
        hide: true,
        disabledUnlock: false,
        points: 0
    }

    var sendData = {
        messageType: "load",
        skillUpdate: false,
        skillData: {
            skills: [],
            newSkills: [],
            skillPoints: 0
        }
    }

    var nodes;
    var edges;
    var network;

    function draw() { // Network must be initialized using a function, otherwise reloading the page causes problems
        nodes = new vis.DataSet([
            { id: 1, label: 'HP', level: 0, available: true, purchased: false, description: "Increases HP by 3%" },
            { id: 2, label: 'MP', level: 1, available: false, purchased: false, description: "Increases MP by 3%" },
            { id: 3, label: 'DEF', level: 1, available: false, purchased: false, description: "Increases Defense by 2%" },
            { id: 4, label: 'RES', level: 1, available: false, purchased: false, description: "Increases Resistance by 2%" },
            { id: 5, label: 'STR', level: 1, available: false, purchased: false, description: "Increases Strength by 2%" },
            { id: 6, label: 'MAG', level: 1, available: false, purchased: false, description: "Increases Magic by 2%" },
            { id: 7, label: 'AGI', level: 1, available: false, purchased: false, description: "Increases Agility by 2%" },
            { id: 8, label: 'LCK', level: 1, available: false, purchased: false, description: "Increases Luck by 2%" },
            { id: 9, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Fire 1 to Fire 2 (MP Cost: 5 --> 25)" },
            { id: 10, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Cure 1 to Cure 2 (MP Cost: 5 --> 25)" },
            { id: 11, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Protect 1 to Protect 2 (MP Cost: 10 --> 50)" },
            { id: 12, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Deprotect 1 to Deprotect 2 (MP Cost: 10 --> 50)" },
            { id: 13, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Shell 1 to Shell 2 (MP Cost: 10 --> 50)" },
            { id: 14, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Deshell 1 to Deshell 2 (MP Cost: 10 --> 50)" },
            { id: 15, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Bravery 1 to Bravery 2 (MP Cost: 10 --> 50)" },
            { id: 16, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Debrave 1 to Debrave 2 (MP Cost: 10 --> 50)" },
            { id: 17, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Faith 1 to Faith 2 (MP Cost: 10 --> 50)" },
            { id: 18, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Defaith 1 to Defaith 2 (MP Cost: 10 --> 50)" },
            { id: 19, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Haste 1 to Haste 2 (MP Cost: 10 --> 50)" },
            { id: 20, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Slow 1 to Slow 2 (MP Cost: 10 --> 50)" },
            { id: 21, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Regen 1 to Regen 2 (MP Cost: 15 --> 75)" },
            { id: 22, label: 'SPL', level: 2, available: false, purchased: false, description: "Upgrades Poison 1 to Poison 2 (MP Cost: 15 --> 75)" },
            { id: 23, label: 'HP', level: 3, available: false, purchased: false, description: "Increases HP by 7%" },
            { id: 24, label: 'MP', level: 3, available: false, purchased: false, description: "Increases MP by 7%" },
            { id: 25, label: 'STR', level: 3, available: false, purchased: false, description: "Increases Strength by 4%" },
            { id: 26, label: 'DEF', level: 3, available: false, purchased: false, description: "Increases Defense by 4%" },
            { id: 27, label: 'MAG', level: 3, available: false, purchased: false, description: "Increases Magic by 4%" },
            { id: 28, label: 'RES', level: 3, available: false, purchased: false, description: "Increases Resistance by 4%" },
            { id: 29, label: 'STR', level: 3, available: false, purchased: false, description: "Increases Strength by 4%" },
            { id: 30, label: 'DEF', level: 3, available: false, purchased: false, description: "Increases Defense by 4%" },
            { id: 31, label: 'MAG', level: 3, available: false, purchased: false, description: "Increases Magic by 4%" },
            { id: 32, label: 'RES', level: 3, available: false, purchased: false, description: "Increases Resistance by 4%" },
            { id: 33, label: 'AGI', level: 3, available: false, purchased: false, description: "Increases Agility by 4%" },
            { id: 34, label: 'AGI', level: 3, available: false, purchased: false, description: "Increases Agility by 4%" },
            { id: 35, label: 'LCK', level: 3, available: false, purchased: false, description: "Increases Luck by 4%" },
            { id: 36, label: 'LCK', level: 3, available: false, purchased: false, description: "Increases Luck by 4%" },
            { id: 37, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Fire 2 to Fire 3 (MP Cost: 25 --> 125)" },
            { id: 38, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Cure 2 to Cure 3 (MP Cost: 25 --> 125)" },
            { id: 39, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Protect 2 to Protect 3 (MP Cost: 50 --> 250)" },
            { id: 40, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Deprotect 2 to Deprotect 3 (MP Cost: 50 --> 250)" },
            { id: 41, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Shell 2 to Shell 3 (MP Cost: 50 --> 250)" },
            { id: 42, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Deshell 2 to Deshell 3 (MP Cost: 50 --> 250)" },
            { id: 43, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Bravery 2 to Bravery 3 (MP Cost: 50 --> 250)" },
            { id: 44, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Debrave 2 to Debrave 3 (MP Cost: 50 --> 250)" },
            { id: 45, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Faith 2 to Faith 3 (MP Cost: 50 --> 250)" },
            { id: 46, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Defaith 2 to Defaith 3 (MP Cost: 50 --> 250)" },
            { id: 47, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Haste 2 to Haste 3 (MP Cost: 50 --> 250)" },
            { id: 48, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Slow 2 to Slow 3 (MP Cost: 50 --> 250)" },
            { id: 49, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Regen 2 to Regen 3 (MP Cost: 75 --> 375)" },
            { id: 50, label: 'SPL', level: 4, available: false, purchased: false, description: "Upgrades Poison 2 to Poison 3 (MP Cost: 75 --> 375)" }
        ])
        
        edges = new vis.DataSet([
            { from: 1, to: 2 },
            { from: 1, to: 3 },
            { from: 1, to: 4 },
            { from: 1, to: 5 },
            { from: 1, to: 6 },
            { from: 1, to: 7 },
            { from: 1, to: 8 },
            { from: 2, to: 9 },
            { from: 2, to: 10 },
            { from: 3, to: 11 },
            { from: 3, to: 12 },
            { from: 4, to: 13 },
            { from: 4, to: 14 },
            { from: 5, to: 15 },
            { from: 5, to: 16 },
            { from: 6, to: 17 },
            { from: 6, to: 18 },
            { from: 7, to: 19 },
            { from: 7, to: 20 },
            { from: 8, to: 21 },
            { from: 8, to: 22 },
            { from: 9, to: 23 },
            { from: 10, to: 24 },
            { from: 11, to: 25 },
            { from: 12, to: 26 },
            { from: 13, to: 27 },
            { from: 14, to: 28 },
            { from: 15, to: 29 },
            { from: 16, to: 30 },
            { from: 17, to: 31 },
            { from: 18, to: 32 },
            { from: 19, to: 33 },
            { from: 20, to: 34 },
            { from: 21, to: 35 },
            { from: 22, to: 36 },
            { from: 23, to: 37 },
            { from: 24, to: 38 },
            { from: 25, to: 39 },
            { from: 26, to: 40 },
            { from: 27, to: 41 },
            { from: 28, to: 42 },
            { from: 29, to: 43 },
            { from: 30, to: 44 },
            { from: 31, to: 45 },
            { from: 32, to: 46 },
            { from: 33, to: 47 },
            { from: 34, to: 48 },
            { from: 35, to: 49 },
            { from: 36, to: 50 },
        ])
        
        var container = document.getElementById('network')
        var data = {
            nodes: nodes,
            edges: edges
        }
        var options = {
            nodes: {
                shape: 'circle',
                color: {
                    border: 'white',
                    background: 'black',
                    highlight: {
                        border: 'white',
                        background: 'black'
                    }
                },
                font: {
                    color: 'white',
                    size: 20
                },
                widthConstraint: 40
            },
            edges: {
                smooth: {
                    type: 'cubicBezier'
                }
            },
            physics: false,
            interaction: {
                dragNodes: false,
                zoomView: false,
                dragView: false
            },
            layout: {
                hierarchical: true
            }
        }

        network = new vis.Network(container, data, options)

        network.on("selectNode", function(params) {
            $scope.nodeDesc = nodes.get(params.nodes[0]).description;
            var available = nodes.get(params.nodes[0]).available;
            $scope.$applyAsync('object.description = nodeDesc');
            $scope.object.hide = false;

            if (available && $scope.object.points > 0) {
                $scope.object.disabledUnlock = false;
            } else {
                $scope.object.disabledUnlock = true;
            }
        })

        network.on("deselectNode", function(params) {
            $scope.$applyAsync('object.description = "Click on a node to display more information."');
            $scope.object.hide = true;
        })
    }

    $http.post('/skills', sendData).then((responseGood) => {
        $scope.playerData = responseGood.data.playerData;
        $scope.$applyAsync('object.description = "Click on a node to display more information."');
        $scope.$applyAsync('object.points = playerData.skillPoints')
        draw();

        if ($scope.playerData.skills.length > 0) {
            for (i in $scope.playerData.skills) {
                $scope.updateNode($scope.playerData.skills[i]);
            }
        }
        // Next: Give enemies access to upgraded stats at certain levels (level determines spell rank)

        sendData.skillData.skills = $scope.playerData.skills;
        sendData.skillData.skillPoints = $scope.playerData.skillPoints;
    }, (responseBad) => {
        alert("Error: Page load failed");
    });

    $scope.updateNode = function(nodeId) {
        var selectedNode = nodes.get(nodeId);
        selectedNode.color = {
            border: 'yellow',
            highlight: {
                border: 'yellow'
            }
        }
        selectedNode.available = false;
        selectedNode.purchased = true;
        var childNodes = network.getConnectedNodes(nodeId, 'to');
        nodes.update(selectedNode);

        for (i in childNodes) {
            selectedNode = nodes.get(childNodes[i]);
            selectedNode.available = true;
            nodes.update(selectedNode);
        }

        $scope.object.disabledUnlock = true;
    }

    $scope.unlock = function() {
        var selected = network.getSelectedNodes();
        $scope.updateNode(selected[0]);
        sendData.skillData.skills.push(selected[0]);
        sendData.skillData.newSkills.push(selected[0]);
        $scope.$applyAsync('object.points = object.points - 1');
        sendData.skillData.skillPoints = $scope.object.points;
    }

    $scope.submit = function() {
        sendData.messageType = "loadPlayer";
        sendData.skillUpdate = true;
        sendData.skillData.skillPoints = $scope.object.points;
        $http.post('/game', sendData).then((responseGood) => {
            var url = "http://" + $window.location.host + "/game";
            $window.location.href = url;
        }, (responseBad) => {
            alert(responseBad.data);
        });
    }
});