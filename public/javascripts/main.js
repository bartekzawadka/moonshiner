/**
 * Created by barte_000 on 2016-12-26.
 */
angular.module('Moonshiner', ['ngMaterial', 'ngRoute', 'ngMessages', 'angular-input-stars', 'ngFacebook'])
    .config(['$routeProvider', '$locationProvider', '$facebookProvider', function ($routeProvider, $locationProvider, $facebookProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/liquids', {
                templateUrl: '/partials/liquids.html',
                controller: 'LiquidsController'
            })
            .when('/liquids/liquid', {
                templateUrl: '/partials/liquid.html',
                controller: 'LiquidController'
            })
            .when('/liquids/liquid/:id', {
                templateUrl: '/partials/liquid.html',
                controller: 'LiquidController'
            })
            .when('/setups', {
                templateUrl: '/partials/setups.html',
                controller: SetupsController
            }).otherwise({redirectTo: '/liquids'});

        $facebookProvider.setAppId('1618843905092197');

    }]).run(function ($rootScope) {
    // Load the facebook SDK asynchronously
    (function () {
        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {
            return;
        }

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/sdk.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());

    moment.updateLocale('en',{
        calendar : {
            lastDay : '[Yesterday at] HH:mm',
            sameDay : '[Today at] HH:mm',
            nextDay : '[Tomorrow at] HH:mm',
            lastWeek : '[last] dddd [at] HH:mm',
            nextWeek : 'dddd [at] HH:mm',
            sameElse : 'dddd, MMMM D, YYYY HH:mm'
        }});

}).controller('MainController', function ($scope, $location, $mdDialog, $http, $window, $rootScope, AuthService) {

    $scope.tabs = [
        {name: "liquids", title: "Liquids", href: "liquids"},
        // {name: "setups", title: "Setups", href: "setups"}
    ];
    //$scope.accountLoading = true;

    $scope.currentNavItem = '';

    $scope.$on('$routeChangeStart', function (next, current) {
        var addressItems = $location.path().split("/");
        if (!addressItems || addressItems.length < 2)
            return;
        var item = addressItems[1];

        for (var k in $scope.tabs) {
            if (item == $scope.tabs[k].href) {
                $scope.currentNavItem = item;
                break;
            }
        }
    });

    $scope.signIn = function (ev) {
        $mdDialog.show({
            controller: 'LoggingController',
            templateUrl: '/partials/dialogs/login-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: true
        });
    };

    $scope.signUp = function (ev) {
        $mdDialog.show({
            controller: 'RegisterController',
            templateUrl: '/partials/dialogs/register-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: true
        });

    };

    $scope.logOff = function () {
        AuthService.logout().then(function () {
            $window.location.reload();
            $location.url('/');
        });
    }
});