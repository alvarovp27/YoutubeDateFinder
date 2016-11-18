var app = angular.module('youtubeDateFinder', ['ngMaterial']);

app.controller('helloWorld', function($scope){
    $scope.hello = "Hello World!";
});

app.controller('searchFormController', function($scope){
    $scope.search = function(find){
        $scope.findTest = angular.copy(find);
    };
});

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('indigo')
      .primaryPalette('indigo')
      .accentPalette('blue')
      .warnPalette('red');

    $mdThemingProvider.theme('lime')
      .primaryPalette('lime')
      .accentPalette('orange')
      .warnPalette('blue');
    
    // This is the absolutely vital part, without this, changes will not cascade down through the DOM.
    $mdThemingProvider.alwaysWatchTheme(true);
  })