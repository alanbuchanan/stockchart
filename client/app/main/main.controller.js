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
    var apiFiletype     = 'json';
    var startDate       = 'start_date=2015-10-01';
    var apiKey          = 'api_key=_KTbZgHZNzpge1azUsh8';

    var apiCallUrl =  urlBase         + '/' +
                      quandlCategory  + '/' +
                      stockName       + '.' +
                      apiFiletype     + '?' +
                      startDate       + '?' +
                      apiKey;

    console.log(apiCallUrl);

    $http.get(apiCallUrl)
      .success(function (data) {

        var myData = data.dataset;

        //Make dates array
        myData.dates = [];
        myData.data.forEach(function (item) {
          myData.dates.push(item[0]);
        });

        //Make plot array
        myData.plots = [];
        myData.data.forEach(function (item) {
          myData.plots.push(item[5]);
        });

        console.log(myData);

        var chart = c3.generate({
          data: {
            rows:[
              ['AAPL'],
              myData.plots
            ]
          }
        });
      });


  });
