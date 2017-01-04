/**
 * Created by barte_000 on 2016-12-30.
 */
function LiquidController($scope, $http, $routeParams, $mdDialog){

    $scope.aroma = {};
    $scope.acc = {};

    $scope.comment = {};
    $scope.commentsVisible = false;

    $scope.liquid = {
        id: "",
        name: "",
        base: {
            manufacturer: "",
            concentration: "",
            pg_vg: "",
            amount: ""
        },
        aromas: [],
        accessories: [],
        pg_vg: "",
        rating: "",
        description: "",
        comments: [],
        isPrivate: false,
        author: ""
    };

    if($routeParams.id){
        editMode();
    }else{
        regMode();
    }

    function editMode(){
        $scope.title = "Editing liquid";
        $scope.commentsVisible = true;

        $http.get('/api/liquid/'+$routeParams.id).success(function(data){
            //var form = data.form
        }).error(function(e){
            console.log(e);
        });
    }

    function regMode(){
        $scope.title = "Adding liquid";
    }

    $scope.addAroma = function(){
        $scope.liquid.aromas.push({
            name: $scope.aroma.name,
            concentration: $scope.aroma.concentration
        });
        $scope.aroma = {};
    };

    $scope.addAccessory = function(){
        $scope.liquid.accessories.push({
            name: $scope.acc.name,
            concentration: $scope.acc.concentration
        });
        $scope.acc = {};
    };

    $scope.addComment = function(){
        $scope.liquid.comments.push({
            author: $scope.comment.author,
            rating: $scope.comment.rating,
            comment: $scope.comment.comment
        });
        $scope.comment = {};
    };

    $scope.showConfirm = function(ev){
        var confirm = $mdDialog.confirm()
            .title('Would you like to cancel this operation?')
            .textContent('All changes already made will be lost')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function(){
            window.location.href = '/';
        }, function(){

        });
    };

    $scope.saveLiquid = function(){
        $http({
            method: "POST",
            url: '/api/liquid/'+$scope.liquid.id,
            data: $scope.liquid
        }).then(function(res){
            console.log(res);
            window.location.href = '/';
        }, function(e){

        });
    }
}