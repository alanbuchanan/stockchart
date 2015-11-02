'use strict';

angular.module('stockchartApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    var urlBase = 'https://www.quandl.com/api/v3/datasets';
    var quandlCategory = 'WIKI';
    var stockName = 'AAPL';
    var apiFiletype = 'csv';
    var apiKey = '_KTbZgHZNzpge1azUsh8';

    $http.get(
    urlBase         + '/' +
    quandlCategory  + '/' +
    stockName       + '.' +
    apiFiletype     +
    '?api_key='     + apiKey )
      .success(function (data) {
        console.log(data);
      })

  });
