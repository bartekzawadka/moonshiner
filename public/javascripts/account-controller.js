/**
 * Created by barte_000 on 2017-05-04.
 */
function AccountController($scope, $http, $location, AuthService){

    $scope.account = {};
    $scope.showAvatarEdit = false;
    $scope.avatarToEdit = '_';
    $scope.finalAvatar = '_';

    $scope.changeAvatar = function(){
        $scope.avatarToEdit = $scope.account.picture;
        $scope.showAvatarEdit = true;
    };

    $scope.avatarCancelled = function(){
        $scope.finalAvatar = '_';
        $scope.showAvatarEdit = false;
    };

    $scope.saveChanges = function(){

        if($scope.finalAvatar && $scope.finalAvatar !== '_'){
            $scope.account.picture = $scope.finalAvatar;
        }
        $http({
            method: "POST",
            url: '/user/account',
            data: $scope.account
        }).then(function(res){
            AuthService.updateUserInfo(res.data.auth);
            loadProfile();
            $location.path('/');
        }, function(e){
            console.log(e);
        })
    };

    $scope.abortChanges = function(){
      $location.path('/liquids');
    };

    var loadProfile = function() {

        if (AuthService.isLoggedIn()) {
            $scope.newPic = "_";
            $http.get('/user/account/' + AuthService.getUser().user._id).then(function (data) {
                if (!data)
                    return;
                $scope.account = data.data;
                $scope.account.id = $scope.account._id;
            }, function (e) {
                $location.path('/liquids');
                console.log(e);
            });
        } else {
            $location.url('/liquid/' + id);
        }
    };
    loadProfile();
}