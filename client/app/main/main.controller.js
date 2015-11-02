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

    var urlBase         = 'https://www.quandl.com/api/v3/datasets';
    var quandlCategory  = 'WIKI';
    var stockName       = 'AAPL';
    var apiFiletype     = 'csv';
    var startDate       = 'start_date=2014-11-01';
    var apiKey          = 'api_key=_KTbZgHZNzpge1azUsh8';

    var apiCallUrl =  urlBase         + '/' +
                      quandlCategory  + '/' +
                      stockName       + '.' +
                      apiFiletype     + '?' +
                      startDate       + '?' +
                      apiKey;

    console.log(apiCallUrl);

    var chart = c3.generate({
      data: {
        url: apiCallUrl
      }
    });

    //$http.get(apiCallUrl)
    //  .success(function (data) {
    //    var chart = c3.generate({
    //      bindto: '#chart',
    //      data: {
    //        url:
    //      }
    //    })
    //  });


  });
