/**
 * Created by barte_000 on 2016-12-30.
 */
angular.module('Moonshiner').controller('LiquidController', function($scope, $http, $routeParams, $mdDialog){

    $scope.aroma = {};
    $scope.acc = {};

    $scope.comment = {};
    $scope.commentsVisible = false;
    $scope.accessoriesVisible = true;

    $scope.rating = 0;

    $scope.canAddRating = false;

    $scope.isNewDocument = false;

    $scope.cancelButtonText = "Cancel";

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
        $scope.cancelButtonText = "Go back";

        $http.get('/api/liquid/'+$routeParams.id).then(function(data){
            $scope.liquid = data.data;
            updateRatingSection();

            $scope.commentsVisible = (($scope.$parent.account && $scope.$parent.account.isAuthenticated)
                                    || ($scope.liquid.comments != null && $scope.liquid.comments.length > 0));

            $scope.accessoriesVisible = $scope.isNewDocument || ($scope.liquid.accessories != null && $scope.liquid.accessories.length > 0)
        }, function(e){
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
        var redirect = function(){
            window.location.href = '/liquids';
        };

        if(!$scope.isNewDocument){
            redirect();
            return;
        }


        var confirm = $mdDialog.confirm()
            .title('Would you like to cancel this operation?')
            .textContent('All changes already made will be lost')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(redirect);
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

    $scope.showRatings = function(){
        $mdDialog.show({
            locals: {data: {
                name: $scope.liquid.name,
                ratings: $scope.liquid.ratings
            }
            },
            controller: 'RatingsDialogController',
            templateUrl: '/partials/dialogs/liquid-ratings-dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        });
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