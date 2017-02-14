/**
 * Created by barte_000 on 2016-12-29.
 */
function LiquidsController($scope, $location, LiquidsProvider, LiquidsFilterService){

    $scope.liquids = [];
    $scope.filterVisible = false;
    $scope.filterIcon = "expand_more";


    $scope.clearFilter = function(openPan){
        $scope.filter = LiquidsFilterService.resetFilter();
        if(openPan != undefined && openPan != null)
            $scope.toggleFilter(openPan);

        $scope.getLiquids();
    };

    $scope.toggleFilter = function(openPan){
        if(openPan == undefined || openPan == null || openPan === 'undefined')
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

    $scope.keyPress = function(event){
        if(event.keyCode === 13){
            $scope.getLiquids();
        }
    };

    $scope.togglePrivateOnly = function(){
      if($scope.filter.privateOnly)
          $scope.filter.privateOnly = null;
      else
          $scope.filter.privateOnly = true;

      LiquidsFilterService.setFilter($scope.filter);
    };

    $scope.filter = LiquidsFilterService.getFilter();
    $scope.getLiquids();
}