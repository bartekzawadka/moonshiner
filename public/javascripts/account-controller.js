/**
 * Created by barte_000 on 2017-05-04.
 */
angular.module('Moonshiner').controller('AccountController', function($scope){

    $scope.image = {
        myImage: '',
        myCroppedImage: '_'
    };

    $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
        if (flowFile && flowFile.file) {
            // ng-img-crop
            var imageReader = new FileReader();
            imageReader.onload = function(image) {
                $scope.$apply(function($scope) {
                    $scope.image.myImage = image.target.result;
                });
            };
            imageReader.readAsDataURL(flowFile.file);
        }
    });

    $scope.removeImage = function(){
        $scope.$flow.cancel();
        $scope.image.myCroppedImage = "_";
    }
});