/**
 * Created by barte_000 on 2017-02-12.
 */
angular.module('Moonshiner').factory('LiquidsFilterService', function LiquidsFilterService($rootScope, AuthService){

    function getDefaultFilter(){
        return {
            phrase: null,
            privateOnly: false,
            onlyMyItems: false,
            privateOnlyOptions: [
                {value: null, title: "All"},
                {value: false, title: "Public"},
                {value: true, title: "Private"}
            ],
            sortByOptions: [
                {name: "name", title: "Name"},
                {name: "rating", title: "Rating"},
                {name: "author", title: "Author"},
                {name: "date", title: "Last update"}
            ],
            sortBy: {
                item: "name",
                ascending: true
            },
            lastUpdate: {
                from: null,
                to: null
            }
        };
    }

    $rootScope.liquidsFilter = getDefaultFilter();

    function getFilter(){
        if(!AuthService.isLoggedIn()){
            $rootScope.liquidsFilter.privateOnly = false;
        }
        return $rootScope.liquidsFilter;
    }

    return {
        getFilter: function(){
            return getFilter();
        },
        setFilter: function(newFilter){
            $rootScope.liquidsFilter = newFilter;
        },
        resetFilter: function(){
            $rootScope.liquidsFilter = getDefaultFilter();
            return getFilter();
        }
    }
});