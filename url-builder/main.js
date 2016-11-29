var myApp = angular.module('myApp', []);

app.filter('nospace', function () {
    return function (value) {
        var str = value.replace(/\s+/g, '');
        return str;
    };
});

myApp.factory('Data', function(){



});

app.run(function($rootScope,$window){

   $rootScope.prompt = $window.prompt;
});


