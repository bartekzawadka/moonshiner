/**
 * Created by barte_000 on 2016-12-29.
 */
function LiquidsController($scope, $http, $routeParams, $location){

    $scope.liquids = [];
    $scope.filter = {
        isVisible: false,
        icon: "expand_more",
        filterIn: [
            {name: "name", title: "Name", checked: true},
            {name: "description", title: "Description", checked: true},
            {name: "author", title: "Author", checked: true},
            {name: "aromas", title: "Aromas", checked: true},
            {name: "accessories", title: "Accessories", checked: true}
        ],
        sortByOptions: [
            {name: "name", title: "Name"},
            {name: "rating", title: "Rating"},
            {name: "author", title: "Author"},
            {name: "date", title: "Last update"}
        ],
        sortBy: {
          item: null,
          ascending: true
        },
        lastUpdate: {
            from: null,
            to: null
        }
    };

    $scope.toggleFilter = function(){
        $scope.filter.isVisible = !$scope.filter.isVisible;
        if($scope.filter.isVisible)
            $scope.filter.icon = "expand_less";
        else{
            $scope.filter.icon = "expand_more";
        }
    };

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
}