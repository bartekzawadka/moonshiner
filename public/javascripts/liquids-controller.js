/**
 * Created by barte_000 on 2016-12-29.
 */
function LiquidsController($scope, $location, LiquidsProvider, LiquidsFilterService){

    $scope.liquids = [];

    $scope.clearFilter = function(openPan){
        $scope.filter = LiquidsFilterService.resetFilter();
        if(openPan != undefined && openPan != null)
            $scope.toggleFilter(openPan);

        $scope.getLiquids();
    };

    //$scope.filter = LiquidsFilterService.getFilter();
    // $scope.filter = {
    //     isVisible: false,
    //     icon: "expand_more",
    //     phrase: null,
    //     privateOnly: false,
    //     filterIn: [
    //         {name: "name", title: "Name", checked: true},
    //         {name: "description", title: "Description", checked: true},
    //         {name: "author", title: "Author", checked: true},
    //         {name: "aromas", title: "Aromas", checked: true},
    //         {name: "accessories", title: "Accessories", checked: true}
    //     ],
    //     sortByOptions: [
    //         {name: "name", title: "Name"},
    //         {name: "rating", title: "Rating"},
    //         {name: "author", title: "Author"},
    //         {name: "date", title: "Last update"}
    //     ],
    //     sortBy: {
    //       item: "name",
    //       ascending: true
    //     },
    //     lastUpdate: {
    //         from: null,
    //         to: null
    //     }
    // };

    $scope.toggleFilter = function(openPan){
        if(openPan == undefined || openPan == null || openPan === 'undefined')
            $scope.filter.isVisible = !$scope.filter.isVisible;
        else
            $scope.filter.isVisible = openPan;

        if($scope.filter.isVisible)
            $scope.filter.icon = "expand_less";
        else{
            $scope.filter.icon = "expand_more";
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

    $scope.filter = LiquidsFilterService.getFilter();
    $scope.getLiquids();
}