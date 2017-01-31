/**
 * Created by barte_000 on 2016-12-29.
 */
function LiquidsController($scope, $http, $routeParams, $rootScope){
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
}