/**
 * Created by barte_000 on 2017-02-10.
 */
angular.module('Moonshiner').factory('LiquidsProvider', function LiquidsProvider($window, $http, $location, $rootScope, $q){

    function buildFilter(filter){
        var filterData = null;

        if(filter){
            filterData = {
                filter: {},
                sort: {}
            };
            var fields = [];
            if(filter.filterIn){
                for(var k in filter.filterIn){
                    if(filter.filterIn.hasOwnProperty(k)){
                        if(filter.filterIn[k].checked){
                            fields.push(filter.filterIn[k].name);
                        }
                    }
                }

                filterData.filter.fields = JSON.stringify(fields);
            }

            filterData.filter.lastUpdate = filter.lastUpdate;
            filterData.filter.privateOnly = filter.privateOnly;
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
        getLiquids: function(filter, callback){
            var deferred = $q.defer(),
                cb = callback || angular.noop;

            $http({
                url: '/api/liquids',
                method: 'GET',
                params: buildFilter(filter)
            }).then(function(res){
                if(res.status && res.status != 200){
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