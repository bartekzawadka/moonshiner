/**
 * Created by barte_000 on 2016-12-30.
 */
angular.module('Moonshiner').controller('LiquidController', function($scope, $http, $routeParams, $mdDialog){

    $scope.aroma = {};
    $scope.acc = {};

    $scope.comment = {};
    $scope.commentsVisible = false;

    $scope.rating = 0;

    $scope.canAddRating = false;

    $scope.isNewDocument = false;

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
        ratings: [],
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

    updateRatingSection();

    function editMode(){
        $scope.isNewDocument = false;
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
        $scope.isNewDocument = true;
    }

    function updateRatingSection (){

        if($scope.isNewDocument || !$scope.$parent.account || !$scope.$parent.account.isAuthenticated) {
            $scope.canAddRating = false;
            return;
        }

        if(!$scope.liquid.ratings || $scope.liquid.ratings.length == 0) {
            $scope.canAddRating = true;
            return;
        }
        for(var k in $scope.liquid.ratings){
            if($scope.liquid.ratings[k].author && $scope.liquid.ratings[k].author == $scope.$parent.account.user.username) {
                $scope.canAddRating = false;
                return;
            }
        }

        $scope.canAddRating = true;
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

    $scope.addRating = function(){
        $scope.liquid.ratings.push({
            author: $scope.$parent.account.user.id,
            rating: $scope.rating,
            date: new Date()
        });
        updateRatingSection();
    };

    $scope.clickHandler= function (prop) {
        $scope.rating = prop;
    };

    $scope.saveLiquid = function(){
        $scope.liquid.author = $scope.$parent.account.user.id;

        $http({
            method: "POST",
            url: '/api/liquid/'+$scope.liquid.id,
            data: $scope.liquid
        }).then(function(res){
            console.log(res);
            window.location.href = '/';
        }, function(e){

        });
    };
});