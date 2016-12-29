var myApp = angular.module('myApp', []);
myApp.filter('nospace', function () {
    return function (value) {
        var str = value.replace(/\s+/g, '');
        return str;
    };
});
myApp.filter('escape', function () {
    return window.encodeURIComponent;
});
myApp.factory('Data', function () {});
myApp.run(function ($rootScope, $window) {
    $rootScope.prompt = $window.prompt;
});