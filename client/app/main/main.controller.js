'use strict';

angular.module('stockchartApp')
  .controller('MainCtrl', function ($scope, $http) {
    //**************************************************************
    // Build a URL string for the query
    //**************************************************************

    var stocks = ['AAPL', 'MSFT', 'MMM'];

    var currentUrl = '';

    var createQuandlQueryUrl = function (stockName) {
      currentUrl = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stockName + '.json' +
        '?start_date=2015-10-01' +
        '&order=asc' +
        '&api_key=zwfVKsRK7iy4KCdzcXaG';
    };

    var stocksUrls = [];

    stocks.forEach(function (stock) {
      createQuandlQueryUrl(stock);
      stocksUrls.push(currentUrl);
    });

    console.log(stocksUrls);


    //**************************************************************
    // Request data from Quandl
    //**************************************************************

    var datesToGraph = [];
    var plotsInit = [];
    var chart;
    var resultArr = [];

    // Init
    stocksUrls.forEach(function (stockUrl) {

      $http.get(stockUrl)
        .success(function (data) {

          var myData = data.dataset;
          console.log(myData);

          // Make dates array
          myData.dates = [];
          myData.data.forEach(function (item) {
            myData.dates.push(item[0]);
          });

          myData.dates.unshift('x');
          console.log('dates: ', myData.dates);

          datesToGraph = myData.dates;

          var myData = data.dataset;

          // Make plot array
          myData.plots = [];
          myData.data.forEach(function (item) {
            myData.plots.push(item[5]);
          });

          myData.plots.unshift(myData.name);
          console.log('plots: ', myData.plots);

          resultArr.push(myData.plots);

          console.log(resultArr);

          if(resultArr.length === stocksUrls.length){
            //Declare the c3 chart and init with value
            chart = c3.generate({
              data: {
                x: 'x',
                columns: [
                  datesToGraph, resultArr[0]
                ]
              },
              axis: {
                x: {
                  type: 'timeseries',
                  tick: {
                    format: '%Y-%m-%d'
                  }
                }
              }
            });

             //Fill in the chart with remainder of array
            for (var i = 1; i < resultArr.length; i++) {
              chart.load({
                columns: [
                  resultArr[i]
                ]
              })
            }

          }

          var jsonArr = [];

          myData.data.forEach(function (element) {
            jsonArr.push({name: element[0], val: element[5]});
          });

        })
        .error(function (error) {
          console.log(error);
        })
    });

    console.log('resultArr: ', resultArr);

    $scope.delete = function () {
      chart.unload({
        ids: ['3M Company (MMM) Prices, Dividends, Splits and Trading Volume']
      });
    }

    $scope.add = function () {
      chart.load({
        columns: [resultArr[2]]
      })
    }

  });

// TODO: implement add capability
// TODO: implement buttons with remove properties
// TODO: Change number format from 8000000 to 8.0, or similar
// TODO: label 'val' to be the stock in question
// TODO: implement input and backend
