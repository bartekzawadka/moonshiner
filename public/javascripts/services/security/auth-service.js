angular.module('Moonshiner').factory('AuthService', function AuthService($window, $http, $location, $rootScope, $q){

    function setAccountToDefault(){
        if(!$rootScope.account){
            $rootScope.account = {
                isAuthenticated: false,
                user: null
            }
        }else{
            $rootScope.account.isAuthenticated = false;
            $rootScope.account.user = null;
        }
    }

    $rootScope.account = getUserFromSessionStorage();

    function getUserFromSessionStorage(){
        var token = $window.sessionStorage.token;
        var picture = $window.sessionStorage.picture;
        if(token && token !== 'undefined'){
            var encodedProfile = token.split('.')[1];
            var profile = JSON.parse(urlBase64Decode(encodedProfile));
            profile.picture = picture;
            return {
                user: profile,
                isAuthenticated: true
            };
        }
        return undefined;
    }

    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }

        return window.atob(output);
    }

    return {
        login: function(user, callback){
            var deferred = $q.defer(), 
                cb = callback || angular.noop;
            $http.post('/user/login', user).then(function(data){

                setAccountToDefault();

                $window.sessionStorage.token = data.data.token;
                var encodedProfile = data.data.token.split('.')[1];
                var profile = JSON.parse(urlBase64Decode(encodedProfile));
                $rootScope.account.isAuthenticated = true;
                $rootScope.account.user = profile;

                cb();
                deferred.resolve(profile);
            }, function(e){
                setAccountToDefault();

                var error = "";
                if(e.data){
                    if(e.data.error)
                        error = e.data.error;
                    else
                        error = e.data;
                }

                cb(error);
                deferred.reject(error);
            });

            return deferred.promise;
        },

        loginFacebook: function(user, callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;
            $http.post('/user/login/facebook', user).then(function(data){

                $window.sessionStorage.token = data.data.token;
                $window.sessionStorage.picture = data.data.picture;

                setAccountToDefault();

                $rootScope.account.isAuthenticated = true;
                var encodedProfile = data.data.token.split('.')[1];
                var profile = JSON.parse(urlBase64Decode(encodedProfile));
                $rootScope.account.user = profile;
                $rootScope.account.user.picture = data.data.picture;

                cb();
                deferred.resolve(profile);
            }, function(e){

                delete $window.sessionStorage.token;
                setAccountToDefault();

                var error = "";
                if(e.data){
                    if(e.data.error)
                        error = e.data.error;
                    else
                        error = e.data;
                }

                cb(error);
                deferred.reject(error);
            });
            return deferred.promise;
        },

        register: function(user, callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;

            $http.post('/user/register', user).then(function(data){
                $window.sessionStorage.token = data.data.token;

                setAccountToDefault();

                $rootScope.account.isAuthenticated = true;
                var encodedProfile = data.data.token.split('.')[1];
                var profile = JSON.parse(urlBase64Decode(encodedProfile));
                $rootScope.account.user = profile;

                cb();
                deferred.resolve(profile);
            }, function(e){
                delete $window.sessionStorage.token;
                setAccountToDefault();

                var error = "";
                if(e.data){
                    if(e.data.error)
                        error = e.data.error;
                    else
                        error = e.data;
                }

                cb(error);
                deferred.reject(error);
            });
            return deferred.promise;
        },

        logout: function(callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;

            delete $window.sessionStorage.token;
            setAccountToDefault();

            cb();
            deferred.resolve();
            return deferred.promise;
        },

        getUser: function(){
            return $rootScope.account;
        },

        isLoggedIn: function() {
            return $rootScope.account && $rootScope.account.isAuthenticated; 
        }
    }
});