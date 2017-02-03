/**
 * Created by barte_000 on 2017-01-05.
 */
angular.module('Moonshiner').controller('RegisterController', function($scope, $mdDialog, $window, $location, AuthService){
    $scope.form = {
        username: "",
        fullname: "",
        password: "",
        confirmPassword: ""
    };

    $scope.doSignUp = function(){
        AuthService.register($scope.form).then(function(){
            $window.location.reload();
            $location.url('/');
        }, function(e){
            $scope.errorInfo = e;
        });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});