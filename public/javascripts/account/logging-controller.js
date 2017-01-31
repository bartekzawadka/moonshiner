/**
 * Created by barte_000 on 2017-01-05.
 */

angular.module('Moonshiner').controller('LoggingController', function ($scope, $http, $mdDialog, $window, $location, $facebook, AuthService){
    $scope.form = {
        username: "",
        password: ""
    };

    $scope.errorInfo = "";

    $scope.doSignIn = function(){
        $scope.errorInfo = "";

        AuthService.login($scope.form).then(function(){
            $window.location.reload();
            $location.url('/');
        }, function(e){
            $scope.errorInfo = e;
        })

        // $http.post('/login', $scope.form).then(function(data){
        //     $window.location.reload();
        //     $location.url('/');
        // }, function(e){

        //     if(!e){
        //         $scope.errorInfo = "Log in failed";
        //         return;
        //     }
        //     if(e.data && e.data.error){
        //         $scope.errorInfo = e.data.error;

        //     }
        // });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

//$http.get('/auth/facebook');

    $scope.loginFacebook = function(){
        // $facebook.login().then(function(response){
        //     $scope.me();
        // }, function(resp){
        //     console.log("Error!", resp);
        // });
        $http.get('/auth/facebook');
    };

    $scope.me = function(){
        $facebook.api('/me', {fields: 'id, name, email'}).then(function(resp){
            console.log(resp);
        });
    };
});