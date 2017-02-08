/**
 * Created by barte_000 on 2017-02-08.
 */
angular.module('Moonshiner').directive('displayDate', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            scope.date = attrs.displayDate;
        },
        template: '{{date | momentFormat}}'
    };
});