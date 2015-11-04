'use strict';

angular.module('stockchartApp')
  .controller('MainCtrl', function ($scope, $http, $mdToast) {
    //**************************************************************
    // Build a URL string for the query
    //**************************************************************

    $scope.stocks = ['AAPL', 'EA', 'EBAY', 'F', 'G', 'H', 'L', 'B', 'P', 'G', 'DIS'];

    var currentUrl = '';

    var createQuandlQueryUrl = function (stockName) {
      currentUrl = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stockName + '.json' +
        '?start_date=2015-10-01' +
        '&order=asc' +
        '&api_key=zwfVKsRK7iy4KCdzcXaG';
    };

    var stocksUrls = [];

    $scope.stocks.forEach(function (stock) {
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

          console.log('current URL:', currentUrl);


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

          var truncate = function (name) {
            var indexOfEndBracket = name.indexOf(')');
            return name.substr(0, indexOfEndBracket + 1);
          };

          myData.plots.unshift(truncate(myData.name));
          console.log('plots: ', myData.plots);

          resultArr.push(myData.plots);

          console.log(resultArr);

          if (resultArr.length === stocksUrls.length) {
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
        })
        .error(function (error) {
          console.log(error);
        })
    });

    console.log('resultArr: ', resultArr);

    $scope.delete = function () {
      chart.unload({
        ids: ['Apple Inc. (AAPL)', 'eBay Inc. (EBAY) Prices, Dividends, Splits and Trading Volume']
      });
    };

    $scope.userTypedStockName = '';

    //Toast start*****************************************************
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

    $scope.toastPosition = angular.extend({},last);

    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }

    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };

    var showSimpleToast = function() {
      $mdToast.show(
        $mdToast.simple()
          .content('Please enter a valid stock name.')
          .position($scope.getToastPosition())
          .hideDelay(3000)
      );
    };
    //Toast end*****************************************************

    $scope.add = function () {

      createQuandlQueryUrl($scope.userTypedStockName);
      console.log('current URL:', currentUrl);

      $http.get(currentUrl)
        .success(function (data) {

          var myData = data.dataset;
          console.log(myData);

          // Make plot array
          myData.plots = [];
          myData.data.forEach(function (item) {
            myData.plots.push(item[5]);
          });

          myData.plots.unshift(myData.name);
          console.log('plots: ', myData.plots);

          chart.load({
            columns: [
              myData.plots
            ]
          });

        })
        .error(function (error) {
          console.log('ERR:', error);
          showSimpleToast();
        });

      $scope.userTypedStockName = '';

    }

  });

// TODO: implement buttons with remove properties
// TODO: Change number format from 8000000 to 8.0, or similar
// TODO: label 'val' to be the stock in question
// TODO: implement input and backend
