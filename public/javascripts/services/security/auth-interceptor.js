/**
 * Created by barte_000 on 2017-02-14.
 */
angular.module('Moonshiner').factory('AuthInterceptor', function AuthInterceptor($rootScope, $window, $q, $injector, $location){
   return {
       request: function(config){
           config.headers = config.headers || {};
           if($window.sessionStorage.token){
               config.headers.Authorization = 'Bearer '+$window.sessionStorage.token;
           }
           return config;
       },
       responseError: function(response){
           var dialogService = $injector.get('DialogService');

           var deferred = $q.defer();

           if(response.status === 401) {
               dialogService.showSignIn(null, function(){
                   deferred.reject(response);
               });
           }else if(response.status !== 422){
               var data = {
                   title: response.statusText+" ("+response.status+")"
               };
               if(response.data && response.data.error){
                   if(response.data.error.message){
                       data.message = response.data.error.message;
                   }else{
                       data.message = response.data.error;
                   }
               }
               dialogService.showError(null, data, function(){
                   deferred.reject(response);
               });
           }else{
               deferred.reject(response);
           }

           return deferred.promise;
       }
   }
});