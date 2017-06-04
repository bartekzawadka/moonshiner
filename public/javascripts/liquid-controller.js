/**
 * Created by barte_000 on 2016-12-30.
 */
function LiquidController($scope,$location, $window, $http, $timeout, $routeParams, $mdDialog, AuthService){

    $scope.showLoader = true;

    var initializing = true;
    var formSubmitting = false;
    var isRedirecting = false;
    var formChanged = false;

    $scope.$on('$routeChangeStart', function (next, current) {

        if(!formSubmitting && !isRedirecting && formChanged){
            next.preventDefault();
            $scope.showConfirm(null, next);
        }
    });

    $scope.aroma = {};
    $scope.acc = {};

    $scope.comment = {};
    $scope.commentsVisible = false;
    $scope.accessoriesVisible = true;

    $scope.rating = 0;

    $scope.canSetRating = false;
    $scope.isRequestingRating = false;

    $scope.isNewDocument = false;
    $scope.favoriteConfig = getFavoriteConfig();

    $scope.cancelButton = {
        text: "Cancel",
        icon: "clear"
    };

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

    function getFavoriteConfig(isFavorite){
        if(isFavorite === true){
            return {
                icon: "favorite",
                tooltip: "Remove from favorites",
                isFavorite: true,
                color: '#E63946'
            }
        }else{
            return {
                icon: "favorite_border",
                tooltip: "Add to favorites",
                isFavorite: false,
                color: '#a0a0a0'
            }
        }
    }

    function loadView(){
        if($routeParams.id){
            editMode($routeParams.id);
        }else{
            regMode();
        }
    }

    loadView();

    if($scope.isNewDocument)
        updateRatingSection();

    function editMode(id){
        $scope.isNewDocument = false;
        $scope.title = "Editing liquid";
        $scope.cancelButton.text = "Go back";
        $scope.cancelButton.icon = "arrow_back";

        getLiquid();
    }

    function getLiquid(){
        $http.get('/api/liquid/'+$routeParams.id).then(function(data){
            if(!data)
                return;
            $scope.liquid = data.data;
            $scope.liquid.id = $scope.liquid._id;
            updateRatingSection();

            $scope.commentsVisible = (($scope.$parent.account && $scope.$parent.account.isAuthenticated)
            || ($scope.liquid.comments != null && $scope.liquid.comments.length > 0));

            $scope.accessoriesVisible = $scope.isNewDocument || ($scope.liquid.accessories != null && $scope.liquid.accessories.length > 0);

            $scope.showLoader = false;

            $scope.favoriteConfig = getFavoriteConfig(data.data.isFavorite);
        }, function(){
            $scope.showLoader = false;
            $location.path('/liquids');
        });
    }

    function regMode(){
        $scope.title = "Adding liquid";
        $scope.isNewDocument = true;

        $scope.$watch("liquid", function(){

            if(initializing){
                $timeout(function(){
                    initializing = false;
                })
            }else{
                formChanged = true;
            }
        }, true);

        $scope.showLoader = false;
    }

    function updateRatingSection (){

        if($scope.isNewDocument || !AuthService.getUser()|| !AuthService.getUser().isAuthenticated) {
            $scope.canSetRating = false;
            return;
        }

        if(!$scope.liquid.ratings || $scope.liquid.ratings.length == 0) {
            $scope.canSetRating = true;
            //return;
        }

        for(var k in $scope.liquid.ratings) {
            if($scope.liquid.ratings[k].author && $scope.liquid.ratings[k].author._id == AuthService.getUser().user._id) {
                $scope.rating = $scope.liquid.ratings[k].rating;
                break;
            }
        }

        $scope.canSetRating = true;
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

    $scope.showConfirm = function(ev, next){
        var redirect = function(){
            isRedirecting = true;
            $location.path('/liquids');
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
        $mdDialog.show(confirm).then(redirect
            , function(e){
                console.log(e);
            }
        );
    };

    $scope.setRating = function(prop){

        if($scope.isRequestingRating)
            return;

        var rating = {
            author: AuthService.getUser().user._id,
            rating: prop
        };

        $scope.isRequestingRating = true;

        $http.post('/api/liquid/rating', {
            liquidId: $scope.liquid.id,
            rating: rating
        }).then(function(data){
            $scope.isRequestingRating = false;
            editMode($scope.liquid.id);
        }, function(e){
            $scope.isRequestingRating = false;
            console.log(e);
            editMode($scope.liquid.id);
        });
    };

    $scope.toggleFavorite = function(){
        var favorite = {
            liquidId: $scope.liquid.id
        };

        if($scope.favoriteConfig.isFavorite){
            favorite.insert = -1;
        }else{
            favorite.insert = 1;
        }

        $http.post('/api/liquid/favorites', favorite).then(function(data){
            console.log(data);
            getLiquid();
        }, function(e){
            console.log(e);
        })
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
            $location.path('/');
        }, function(e){
            formSubmitting = false;
            console.log(e);
        });
    };
}