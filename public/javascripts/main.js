/**
 * Created by barte_000 on 2016-12-26.
 */
angular.module('Moonshiner', ['ngMaterial', 'ngRoute', 'ngMessages', 'angular-input-stars','ngFacebook', 'flow', 'ngImgCrop' ])
    .config(function ($routeProvider, $locationProvider, $facebookProvider, $httpProvider, flowFactoryProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/liquids', {
                templateUrl: '/partials/liquids.html',
                controller: LiquidsController
            })
            .when('/liquids/user', {
                templateUrl: '/partials/liquids.html',
                controller: LiquidsController,
                userOnly: true
            })
            .when('/liquids/liquid', {
                templateUrl: '/partials/liquid.html',
                controller: LiquidController
            })
            .when('/liquids/liquid/:id', {
                templateUrl: '/partials/liquid.html',
                controller: LiquidController
            })
            .when('/setups', {
                templateUrl: '/partials/setups.html',
                controller: SetupsController
            })
            .when('/account', {
                templateUrl: '/partials/account.html',
                controller: AccountController
            })
            .otherwise({redirectTo: '/liquids'});

        $facebookProvider.setAppId('1618843905092197');
        $httpProvider.interceptors.push('AuthInterceptor');


        // flowFactoryProvider.defaults = {
        //     target: '',
        //     permanentErrors: [500, 501],
        //     maxChunkRetries: 1,
        //     chunkRetryInterval: 5000,
        //     simultaneousUploads: 1
        // };
        // flowFactoryProvider.on('catchAll', function (event) {
        //     console.log('catchAll', arguments);
        // });
        // // Can be used with different implementations of Flow.js
        // flowFactoryProvider.factory = fustyFlowFactory;

    }).run(function ($rootScope) {
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
            lastWeek : '[Last] dddd [at] HH:mm',
            nextWeek : 'dddd [at] HH:mm',
            sameElse : 'dddd, MMMM D, YYYY HH:mm'
        }});

})
    .controller('MainController', function ($scope, $location, $mdDialog, $http, $window, $rootScope, AuthService, DialogService ) {

    $scope.tabs = [
        {name: "liquids", title: "Recipies", href: "liquids"},
        //{name: "setups", title: "Setups", href: "setups"}
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
        DialogService.showSignIn(ev);
    };

    $scope.signUp = function (ev) {
        DialogService.showSignUp(ev);
    };

    $scope.logOff = function () {
        AuthService.logout().then(function () {
            $location.path('/');
        });
    };

    $scope.openMenu = function($mdMenu, ev){
        $mdMenu.open(ev);
    };
});