/**
 * Created by barte_000 on 2017-02-12.
 */
angular.module('Moonshiner').factory('LiquidsFilterService', function LiquidsFilterService($rootScope){

    function getDefaultFilter(){
        return {
            phrase: null,
            privateOnly: null,
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

    return {
        getFilter: function(){
            return $rootScope.liquidsFilter;
        },
        setFilter: function(newFilter){
            $rootScope.liquidsFilter = newFilter;
        },
        resetFilter: function(){
            $rootScope.liquidsFilter = getDefaultFilter();
            return $rootScope.liquidsFilter;
        }
    }
});