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

    var apiCall = {
      urlBase: {
        name: 'https://www.quandl.com/api/v3/datasets',
        delimiter: '/'
      },
      quandlCategory: {
        name: 'WIKI',
        delimiter: '/'
      },
      stock: {
        name: 'AAPL',
        delimiter: '.'
      },
      apiFileType: {
        name: 'json',
        delimiter: '?'
      },
      startDate: {
        name: 'start_date=2014-10-01',
        delimiter: '?'
      },
      apiKey: {
        name: 'api_key=zwfVKsRK7iy4KCdzcXaG',
        delimiter: ''
      }
    };

    var apiCallUrl = '';
    var apiArr = [];

    Object.keys(apiCall).forEach(function (prop) {
      apiArr.push(apiCall[prop])
    });

    apiArr.forEach(function (element) {
      apiCallUrl += element.name + element.delimiter;
    });

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
