/**
 * Created by barte_000 on 2016-12-30.
 */
function LiquidController($scope, $http, $routeParams, $mdDialog, AuthService){

    var formSubmitting = false;

    $scope.$on('$routeChangeStart', function (next, current) {

        if(!formSubmitting){
            next.preventDefault();
            $scope.showConfirm();
        }
    });

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

    function loadView(){
        if($routeParams.id){
            editMode($routeParams.id);
        }else{
            regMode();
        }
    }

    loadView();

    updateRatingSection();

    function editMode(id){
        $scope.isNewDocument = false;
        $scope.title = "Editing liquid";
        $scope.cancelButtonText = "Go back";

        $http.get('/api/liquid/'+$routeParams.id).then(function(data){
            $scope.liquid = data.data;
            $scope.liquid.id = $scope.liquid._id;
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

        if($scope.isNewDocument || !AuthService.getUser()|| !AuthService.getUser().isAuthenticated) {
            $scope.canAddRating = false;
            return;
        }

        if(!$scope.liquid.ratings || $scope.liquid.ratings.length == 0) {
            $scope.canAddRating = true;
            return;
        }
        for(var k in $scope.liquid.ratings){
            if($scope.liquid.ratings[k].author && $scope.liquid.ratings[k].author._id == AuthService.getUser().user._id) {
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

        var comment = {
            author: AuthService.getUser().user._id,
            comment: $scope.comment.comment
        };

        $http.post('/api/liquid/comment', {
            liquidId: $scope.liquid.id,
            comment: comment
            }).then(function(data){
            editMode($scope.liquid.id);
        }, function(e){
            alert(e);
            editMode($scope.liquid.id);
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
        var rating = {
            author: AuthService.getUser().user._id,
            rating: $scope.rating
        };

        $http.post('/api/liquid/rating', {
            liquidId: $scope.liquid.id,
            rating: rating
        }).then(function(data){
            editMode($scope.liquid.id);
            updateRatingSection();
        }, function(e){
            alert(e);
            editMode($scope.liquid.id);
            updateRatingSection();
        });
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
        $scope.liquid.author = AuthService.getUser().user._id;

        formSubmitting = true;

        $http({
            method: "POST",
            url: '/api/liquid/'+$scope.liquid.id,
            data: $scope.liquid
        }).then(function(res){
            console.log(res);
            window.location.href = '/';
        }, function(e){
            console.log(e);
        });
    };
};