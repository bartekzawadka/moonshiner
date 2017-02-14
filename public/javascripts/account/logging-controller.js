/**
 * Created by barte_000 on 2017-01-05.
 */

angular.module('Moonshiner').controller('LoggingController', function ($scope, $http, $mdDialog, $window, $location, $facebook, AuthService){
    $scope.form = {
        username: "",
        password: ""
    };

    $scope.errorInfo = "";

    var a = AuthService.getUser();

    $scope.doSignIn = function(){
        $scope.errorInfo = "";

        AuthService.login($scope.form).then(function(){
            $location.path('/');
            $mdDialog.cancel();
        }, function(e){
            $scope.errorInfo = e;
        });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.loginFacebook = function(){
        $facebook.login().then(function(response){
            $scope.me();
        }, function(resp){
            console.log("Error!", resp);
        });
    };

    $scope.me = function(){
        $facebook.api('/me', {fields: 'id, name, email'}).then(function(resp){
            AuthService.loginFacebook(resp).then(function(){
                $location.path('/');
                $mdDialog.cancel();
            })
        }, function(e){
            console.log("Error!", e);
        });
    };
});