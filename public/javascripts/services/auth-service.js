angular.module('Moonshiner').factory('AuthService', function AuthService($window, $http, $location, $rootScope, $q){

    $rootScope.account = {};
    $rootScope.account.isAuthenticated = false;

    return {
        login: function(user, callback){
            var deferred = $q.defer(), 
                cb = callback || angular.noop;
            $http.post('/login', user).then(function(data){
                if(!$rootScope.account){
                    $rootScope.account = {};
                }

                $rootScope.account.isAuthenticated = true;
                $rootScope.account.user = data.data;

                cb();
                deferred.resolve();
            }, function(e){
                if(!$rootScope.account){
                    $rootScope.account = {};
                }

                $rootScope.account.isAuthenticated = false;
                $rootScope.account.user = null;

                cb(e);
                deferred.reject($rootScope.account);
            });

            return deferred.promise;
        },

        logout: function(callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;

            $rootScope.account.isAuthenticated = false;
            $rootScope.account.user = null;

            $http.get('/logoff').then(function(){
                cb();
                deferred.resolve();
            }, function(e){
                cb(e);
                deferred.resolve();
            });

            return deferred.promise;
        },

        getUser: function(){
            return $rootScope.account;
        },

        isLoggedIn: function() {
            return $rootScope.account && $rootScope.account.isAuthenticated; 
        },
    }
});