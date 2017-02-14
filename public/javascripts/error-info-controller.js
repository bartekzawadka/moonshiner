/**
 * Created by barte_000 on 2017-02-14.
 */
angular.module('Moonshiner').controller('ErrorInfoController', function ErrorInfoController($scope, $mdDialog, data){
    $scope.errorInfo = data;
    $scope.close = function(){
        $mdDialog.cancel();
    }
});