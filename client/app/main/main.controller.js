
'use strict';
angular.module('stockchartApp')
.controller('MainCtrl', function ($scope, $http, $mdToast) {

    $scope.stocks = [];

    $http.get('/api/stocks').success(function (stocksFromDb) {

      // Will post a stock if empty to avoid errors
      if(stocksFromDb.length === 0){
        $scope.stocks = ['AAPL'];
      } else {
        stocksFromDb.forEach(function (stock, index) {
          $scope.stocks.push(stock.name[0])
        });
        console.log($scope.stocks);

        console.log(stocksFromDb);
      }

      //$scope.stocks = ['AAPL', 'EA', 'EBAY', 'F', 'G', 'H', 'L', 'B', 'P', 'DIS'];

      var currentUrl = '';
      var createQuandlQueryUrl = function (stockName) {
        currentUrl = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stockName + '.json' +
          '?start_date=2015-10-01' +
          '&order=asc' +
          '&api_key=zwfVKsRK7iy4KCdzcXaG';
      };
      var stockNameTruncate = function (name) {
        // TODO: Improve for cases where the bracket you should target is the last one, not the first
        var indexOfEndBracket = name.indexOf(')');
        return name.substr(0, indexOfEndBracket + 1);
      };


      var stocksUrls = [];

      $scope.stocks.forEach(function (stock) {
        createQuandlQueryUrl(stock);
        stocksUrls.push(currentUrl);
      });


      console.log(stocksUrls);
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

            myData.plots.unshift(myData.dataset_code);
            console.log('plots: ', myData.plots);

            resultArr.push(myData.plots);

            console.log(resultArr);

            if (resultArr.length === stocksUrls.length) {
              //Declare the c3 chart and init with value
              chart = c3.generate({
                data: {
                  x: 'x',
                  columns: [datesToGraph].concat(resultArr)
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

            }
          })
          .error(function (error) {
            console.log(error);
          })
      });

      //**************************************************************
      // Request data from Quandl
      //**************************************************************
      var datesToGraph = [];
      var plotsInit = [];

      var chart;

      var resultArr = [];

      console.log('resultArr: ', resultArr);
      $scope.delete = function () {
        chart.unload({
          ids: ['Apple Inc. (AAPL)', 'eBay Inc. (EBAY) Prices, Dividends, Splits and Trading Volume']
        });
      };


      // Toast start*****************************************************
      var last = {
        bottom: false,
        top: true,
        left: false,
        right: true
      };

      $scope.toastPosition = angular.extend({}, last);

      function sanitizePosition() {
        var current = $scope.toastPosition;
        if (current.bottom && last.top) current.top = false;
        if (current.top && last.bottom) current.bottom = false;
        if (current.right && last.left) current.left = false;
        if (current.left && last.right) current.right = false;
        last = angular.extend({}, current);
      }

      $scope.getToastPosition = function () {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
          .filter(function (pos) {
            return $scope.toastPosition[pos];
          })
          .join(' ');
      };

      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .position($scope.getToastPosition())
            .hideDelay(3000)
        );
      };
      // Toast end*****************************************************

      $scope.moreThanOneLeft = function (array) {
        return array.length >= 2;
      }

      $scope.removeStock = function (stockName, index) {

        if($scope.moreThanOneLeft($scope.stocks)){

          console.log(stockName);
          chart.unload({
            ids: [
              stockName
            ]
          });
          $scope.stocks.splice(index, 1);

          $http.delete('/api/stocks/' + stockName).success(function () {
            console.log('deleted');
          }).error(function (error) {
            console.log('delete error: ', error);
          });
        } else {
          console.log('wont delete because only 1 left');
        }
      };

      $scope.userTypedStockName = '';

      $scope.add = function () {

        $scope.userTypedStockName = $scope.userTypedStockName.toUpperCase();

        console.log($scope.stocks);

        if ($scope.stocks.indexOf($scope.userTypedStockName) === -1) {

          console.log('index of ' + $scope.userTypedStockName + ' is ' + $scope.stocks.indexOf($scope.userTypedStockName));

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

              myData.plots.unshift(myData.dataset_code);
              console.log('plots: ', myData.plots);

              chart.load({
                columns: [
                  myData.plots
                ]
              });

              $scope.stocks.push($scope.userTypedStockName);

              $http.post('/api/stocks', {name: $scope.userTypedStockName.toUpperCase()}).success(function () {
                console.log('post req successful');
              }).error(function (error) {
                console.log(error);
              });

              $scope.userTypedStockName = '';
            })
            .error(function (error) {
              console.log('ERR:', error);
              showSimpleToast('Please enter a valid stock code.');
              $scope.userTypedStockName = '';
            });
        } else {
          console.log('dupe');
          showSimpleToast('That stock is already on the graph.');
          $scope.userTypedStockName = '';
        }
      }
    });

  })
.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('orange');
  });

// TODO: Make controller code dry, because there are repeating parts, especially with adding information to graph
// TODO: Make controller code dry, because there are repeating parts, especially with adding information to graph

// TODO: Change number format from 8000000 to 8.0, or similar
// TODO: find out if you can change the label because it would be nice to have 'Apple Inc (AAPL)' as opposed to just '(AAPL)'

// TODO: Improve appearance of chart - look through C3 docs
// TODO: favicon and title

