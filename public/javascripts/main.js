/**
 * Created by barte_000 on 2016-12-26.
 */
angular.module('Moonshiner', ['ngMaterial', 'ngRoute', 'ngMessages', 'angular-input-stars'])
    .config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider

        .when('/liquids', {
            templateUrl: '/partials/liquids.html',
            controller: LiquidsController
        })
        .when('/liquids/liquid',{
            templateUrl: '/partials/liquid.html',
            controller: 'LiquidController'
        })
        .when('/liquids/liquid/:id',{
            templateUrl: '/partials/liquid.html',
            controller: 'LiquidController'
        })
        .when('/setups', {
            templateUrl: '/partials/setups.html',
            controller: SetupsController
    }).otherwise({redirectTo: '/liquids'});
}).controller('MainController', function($scope, $location, $mdDialog, $http, $window){
    $scope.tabs = [
        { name: "liquids", title: "Liquids", href: "liquids" },
        { name: "setups", title: "Setups", href: "setups" }
    ];
    $scope.accountLoading = true;

    $scope.currentNavItem = '';
    $scope.account = {
        isAuthenticated: false,
        user: {}
    };

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

            $scope.accountLoading = true;

            $http.get('/user').then(function (data) {
                $scope.account = data.data;
                $scope.accountLoading = false;
            }, function(e){
                $scope.accountLoading = false;
            });
    });

    $scope.signIn = function(ev){
        $mdDialog.show({
            controller: 'LoggingController',
            templateUrl: '/partials/dialogs/login-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: true
        });
    };

    $scope.signUp = function(ev){
      $mdDialog.show({
          controller: 'RegisterController',
          templateUrl: '/partials/dialogs/register-dialog.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: true
      });

    };

    $scope.logOff = function(){
        $http.get('/logoff').then(function(data){
            $window.location.reload();
            $location.url('/');
        }, function(e){
            console.log('Unable to log off');
            console.log(e);
        });
    }
});