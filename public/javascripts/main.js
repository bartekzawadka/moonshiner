/**
 * Created by barte_000 on 2016-12-26.
 */
var app = angular.module('Moonshiner', ['ngMaterial', 'ngRoute']);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider

        .when('/liquids', {
            templateUrl: '/partials/liquids.html',
            controller: LiquidsController
        }).when('/setups', {
            templateUrl: '/partials/setups.html',
            controller: SetupsController
    }).otherwise({redirectTo: '/liquids'});
});

app.controller('MainController', function($scope, $location){
    $scope.tabs = [
        { name: "liquids", title: "Liquids", href: "liquids" },
        { name: "setups", title: "Setups", href: "setups" }
    ];

    $scope.currentNavItem = '';

    $scope.$on('$routeChangeStart', function(next, current){
            var addressItems = $location.path().split("/");
            if(!addressItems || addressItems.length<2)
                return;
            var item = addressItems[1];

            for(var k in $scope.tabs){
                if(item == $scope.tabs[k].href){
                    $scope.currentNavItem = item;
                    break;
                }
            }
    });
});