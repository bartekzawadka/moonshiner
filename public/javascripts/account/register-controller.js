/**
 * Created by barte_000 on 2017-01-05.
 */
angular.module('Moonshiner').controller('RegisterController', function($scope, $mdDialog, $http, $window, $location){
    $scope.form = {
        username: "",
        fullname: "",
        password: "",
        confirmPassword: ""
    };

    $scope.doSignUp = function(){
        $http.post('/register', $scope.form).then(function(data){
            $window.location.reload();
            $location.url('/');
        }, function(e){
            if(!e || !e.data) {
                $scope.errorInfo = e.data;
            }
        })
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});