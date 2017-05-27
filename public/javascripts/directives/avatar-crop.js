/**
 * Created by barte_000 on 2017-05-14.
 */
angular.module('Moonshiner').directive('avatarCrop', function(){
    return {
        restrict: 'E',
        scope: {
            croppedImage: "=outputImage",
            heading: "@",
            image: "@",
            onCancelled: "&"
        },
        templateUrl: '/partials/templates/avatar-crop.html',
        controller: function($scope, $timeout){
            var controllerLoaded = false;

            $scope.$watch('image', function(n, o, scope){

                String.prototype.trunc = String.prototype.trunc ||
                    function(n){
                        return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
                    };
            }, true);

            $scope.croppedImage = '_';

            $timeout(function(){
                controllerLoaded = true;
            });


            $scope.croppedImageChanged = function(data){
                if(controllerLoaded) {
                    $scope.croppedImage = data;
                }
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

            $scope.cancel = function(){
                $scope.onCancelled();
            }
        }
    }
});