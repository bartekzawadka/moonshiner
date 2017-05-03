/**
 * Created by barte_000 on 2017-02-10.
 */
angular.module('Moonshiner').factory('LiquidsProvider', function LiquidsProvider($window, $http, $location, $rootScope, $q, AuthService){

    function buildFilter(filter){
        var filterData = null;

        if(filter){
            filterData = {
                filter: {},
                sort: {}
            };

            if(filter.lastUpdate && (filter.lastUpdate.from || filter.lastUpdate.to))
                filterData.filter.lastUpdate = filter.lastUpdate;

            filterData.filter.privateOnly = filter.privateOnly;

            if(!AuthService.isLoggedIn())
                filterData.filter.privateOnly = false;

            if(filter.phrase)
                filterData.filter.phrase = filter.phrase;

            filterData.sort = {
                name: "name",
                ascending: true
            };

            if(filter.sortBy){
                if(filter.sortBy.item){
                    filterData.sort.name = filter.sortBy.item;
                }
                if(filter.sortBy.ascending !== undefined && filter.sortBy.ascending != null){
                    filterData.sort.ascending = filter.sortBy.ascending;
                }
            }
        }

        return filterData;
    }

    return {
        // getUserLiquids: function(filter, callback){
        //     var deferred = $q.defer(),
        //         cb = callback || angular.noop;
        //
        //     $http({
        //         url: '/api/liquids/user/'+AuthService.getUser().user._id,
        //         method: 'GET',
        //         params: buildFilter(filter)
        //     }).then(function(res){
        //         if(!res){
        //             cb(null, "No data received");
        //             deferred.reject("No data received");
        //             return deferred.promise;
        //         }
        //
        //         if(res.status && res.status !== 200){
        //             console.log("Error occurred");
        //             var error = "HTTP request resulted with code "+res.status;
        //             cb(null, error);
        //             deferred.reject(error);
        //         }
        //
        //         cb(res.data, null);
        //         deferred.resolve(res.data);
        //     }, function(e){
        //         var error = "";
        //         if(e.data){
        //             if(e.data.error)
        //                 error = e.data.error;
        //             else
        //                 error = e.data;
        //         }
        //
        //         cb(null, error);
        //         deferred.reject(error);
        //     });
        //
        //
        //     return deferred.promise;
        // },

        getLiquids: function(filter, callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;

            var requestData = {
                method: 'GET',
                params: buildFilter(filter)
            };
            if(filter.onlyMyItems){
                var userInfo = AuthService.getUser();
                if(userInfo && userInfo.user && userInfo.user._id){
                    requestData.url = '/api/liquids/user/'+AuthService.getUser().user._id;
                }else{
                    requestData.url = '/api/liquids';
                }
            }else{
                requestData.url = '/api/liquids';
            }

            $http(requestData).then(function(res){
                if(!res){
                    cb(null, "No data received");
                    deferred.reject("No data received");
                    return deferred.promise;
                }

                if(res.status && res.status !== 200){
                    console.log("Error occurred");
                    var error = "HTTP request resulted with code "+res.status;
                    cb(null, error);
                    deferred.reject(error);
                }

                cb(res.data, null);
                deferred.resolve(res.data);
            }, function(e){
                var error = "";
                if(e.data){
                    if(e.data.error)
                        error = e.data.error;
                    else
                        error = e.data;
                }

                cb(null, error);
                deferred.reject(error);
            });


            return deferred.promise;
        }
    }
});