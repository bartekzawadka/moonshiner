/**
 * Created by barte_000 on 2017-01-05.
 */

angular.module('Moonshiner').controller('LoggingController', function ($scope, $http, $mdDialog, $window, $location){
    $scope.form = {
        username: "",
        password: ""
    };

    $scope.errorInfo = "";

    $scope.doSignIn = function(){
        $scope.errorInfo = "";

        $http.post('/login', $scope.form).then(function(data){
            $window.location.reload();
            $location.url('/');
        }, function(e){

            if(!e){
                $scope.errorInfo = "Log in failed";
                return;
            }
            if(e.data && e.data.error){
                $scope.errorInfo = e.data.error;

            }
        });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.loginFacebook = function(){
        $http.get('/auth/facebook');
    }
});