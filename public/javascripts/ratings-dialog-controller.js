/**
 * Created by barte_000 on 2017-01-10.
 */
angular.module('Moonshiner').controller('RatingsDialogController', function($scope, $mdDialog, data){
    $scope.data = data;

    $scope.close = function(){
        $mdDialog.cancel();
    }
});