/**
 * Created by barte_000 on 2016-12-29.
 */
angular.module('Moonshiner').controller('LiquidsController', function ($scope, $http, $routeParams, $location){
    $scope.liquids = [];

    $http.get('/api/liquids').then(function(res){
        if(res.status && res.status != 200){
            console.log("Error occurred");
            return;
        }
        $scope.liquids = res.data;
    }, function(e){
       console.log(e);
    });

    $scope.openLiquid = function(id){
        $location.url('/liquid/'+id);
    };
});