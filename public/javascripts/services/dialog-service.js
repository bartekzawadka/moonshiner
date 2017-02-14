/**
 * Created by barte_000 on 2017-02-14.
 */
angular.module('Moonshiner').factory('DialogService', function DialogService($mdDialog, $location){
   return {
       showSignIn: function(ev){
           $mdDialog.show({
               controller: 'LoggingController',
               templateUrl: '/partials/dialogs/login-dialog.html',
               parent: angular.element(document.body),
               targetEvent: ev,
               clickOutsideToClose: false,
               fullscreen: true
           });
       },
       showSignUp: function(ev){
           $mdDialog.show({
               controller: 'RegisterController',
               templateUrl: '/partials/dialogs/register-dialog.html',
               parent: angular.element(document.body),
               targetEvent: ev,
               clickOutsideToClose: false,
               fullscreen: true
           });
       },
       showError: function(ev, errorInfo){
           $mdDialog.show({
               controller: 'ErrorInfoController',
               templateUrl: '/partials/dialogs/error-info-dialog.html',
               parent: angular.element(document.body),
               targetEvent: ev,
               clickOutsideToClose: false,
               fullscreen: true,
               locals: {
                   data: errorInfo
               }
           });
       }
   }
});