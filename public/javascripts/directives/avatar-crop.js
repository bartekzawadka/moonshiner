/**
 * Created by barte_000 on 2017-05-14.
 */
angular.module('Moonshiner').directive('avatarCrop', function(){
    return {
        restrict: 'E',
        scope: {
            croppedImage: "=outputImage",
            heading: "@"
        },
        templateUrl: '/partials/templates/avatar-crop.html',
        controller: function($scope){
            $scope.image = '';
            $scope.croppedImage = '_';

            $scope.croppedImageChanged = function(data){
                $scope.croppedImage = data;
            };

            $scope.loadImage = function(flowFile){
                if (flowFile && flowFile.file) {
                    // ng-img-crop
                    var imageReader = new FileReader();
                    imageReader.onload = function(image) {
                        $scope.$apply(function($scope) {
                            $scope.image = image.target.result;
                        });
                    };
                    imageReader.readAsDataURL(flowFile.file);
                }
            };

            $scope.removeImage = function(){
                this.$flow.cancel();
                $scope.croppedImage = "_";
            };
        }
    }
});