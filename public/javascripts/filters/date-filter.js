/**
 * Created by barte_000 on 2017-02-05.
 */
angular.module('Moonshiner').filter('momentFormat', [function () {

    function isUndefinedOrNull(val) {
        return angular.isUndefined(val) || val === null;
    }

    function amAddFilter(value, amount, type) {

        if (isUndefinedOrNull(value)) {
            return '';
        }

        return moment(value).calendar();
    }

    return amAddFilter;
}]);