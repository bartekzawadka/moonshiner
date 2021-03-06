/**
 * Created by barte_000 on 2016-12-29.
 */
function LiquidsController($scope, $route, $location, LiquidsProvider, LiquidsFilterService, AuthService){

    $scope.liquids = [];
    $scope.filterVisible = false;
    $scope.filterIcon = "expand_more";

    $scope.userOnly = $route.current.$$route.userOnly;
    if($scope.userOnly === true && !AuthService.isLoggedIn()){
        $scope.userOnly = false;
    }

    $scope.clearFilter = function(openPan){
        $scope.filter = LiquidsFilterService.resetFilter();
        if(openPan !== undefined && openPan !== null)
            $scope.toggleFilterPan(openPan);

        $scope.getLiquids();
    };

    $scope.toggleMyItems = function(){
        $scope.filter.onlyMyItems = !$scope.filter.onlyMyItems;
        $scope.getLiquids();
    };

    $scope.toggleFilterPan = function(openPan){
        if(openPan === undefined || openPan === null || openPan === 'undefined')
            $scope.filterVisible = !$scope.filterVisible;
        else
            $scope.filterVisible = openPan;

        if($scope.filterVisible)
            $scope.filterIcon = "expand_less";
        else{
            $scope.filterIcon = "expand_more";
        }
    };

    $scope.openLiquid = function(id){
        $location.url('/liquid/'+id);
    };

    $scope.getLiquids = function(){

        LiquidsFilterService.setFilter($scope.filter);

        LiquidsProvider.getLiquids(LiquidsFilterService.getFilter()).then(function(data){
            $scope.liquids = data;
        }, function(e){
            console.log(e);
        });
    };

    $scope.enterPressed = function(event){
        if(event.keyCode === 13){
            $scope.getLiquids();
        }
    };

    $scope.escapePressed = function(event){
        if(event && event.keyCode === 27){
            $scope.toggleFilterPan(false);
        }
    };

    $scope.filter = LiquidsFilterService.getFilter();
    $scope.filter.onlyMyItems = $scope.userOnly;
    $scope.getLiquids();
}