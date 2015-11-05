'use strict';
angular.module('stockchartApp')
  .controller('MainCtrl', function ($scope, $http, $mdToast) {

    $scope.stocks = [];
    $scope.isLoading = false;

    Array.prototype.getUnique = function(){
      var u = {}, a = [];
      for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
          continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
      }
      return a;
    };

    $http.get('/api/stocks').success(function (stocksFromDb) {

      stocksFromDb.getUnique();

      $scope.isLoading = false;
      // Will post a stock if empty to avoid errors
      if (stocksFromDb.length === 0) {
        $scope.stocks = ['AAPL'];
        $http.post('/api/stocks', {name: 'AAPL'}).success(function () {

        })
      } else {
        stocksFromDb.forEach(function (stock, index) {
          $scope.stocks.push(stock.name[0])
        });

      }

      var currentUrl = '';
      var codesArray = [];
      var namesArray = [];
      var namesObject = {};
      var stocksUrls = [];
      $scope.userTypedStockName = '';

      var clearUserInput = function () {
        $scope.userTypedStockName = '';
      };

      // Limit is set to 128, aka 6 months worth of results. there is the potential to add more options to how many months/years displayed
      var createQuandlQueryUrl = function (stockName) {
        if (stockName) {
          currentUrl = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stockName + '.json' +
            '?order=desc' +
            '&limit=128' +
            '&api_key=zwfVKsRK7iy4KCdzcXaG';
        }
      };

      // Create an array of urls for all stock names grabbed from db
      $scope.stocks.forEach(function (stock) {
        createQuandlQueryUrl(stock);
        stocksUrls.push(currentUrl);
      });

      // Helper methods begin ****************************************************
      var stockNameTruncate = function (name) {
        var indexOfEndBracket = name.indexOf(')');
        return name.substr(0, indexOfEndBracket + 1);
      };

      var namesObjectifier = function (myData) {
        codesArray.push(myData.dataset_code);

        namesArray.push(stockNameTruncate(myData.name));

        codesArray.forEach(function (code, index) {
          namesObject[code] = namesArray[index];
        });
      };

      var makePlots = function (myData) {

        myData.plots = [];

        myData.data.forEach(function (item) {
          myData.plots.push(item[1]);
        });
        myData.plots.unshift(myData.dataset_code);

      };


      // Helper methods end ****************************************************

      // Init: make dates and plots arrays and load graph
      stocksUrls.forEach(function (stockUrl) {

        $http.get(stockUrl)
          .success(function (data) {

            $scope.isLoading = true;

            var myData = data.dataset;

            // Make dates array
            myData.dates = [];

            myData.data.forEach(function (item) {
              myData.dates.push(item[0]);
            });
            myData.dates.unshift('x');

            datesToGraph = myData.dates;

            // Make plot array
            makePlots(myData);
            resultArr.push(myData.plots);

            // Turn graph labels into full stock names
            namesObjectifier(myData);

            if (resultArr.length === stocksUrls.length) {
              //Declare the c3 chart and init with value
              chart = c3.generate({
                data: {
                  x: 'x',
                  columns: [datesToGraph].concat(resultArr),
                  names: namesObject
                },
                axis: {
                  x: {
                    type: 'timeseries',
                    tick: {
                      format: '%Y-%m-%d'
                    }
                  }
                },
                point: {
                  show: false
                },
                legend: {
                  position: 'right'
                }
              });

              $scope.isLoading = false;

            }
          })
          .error(function (error) {
            console.log(error);
          })
      });
      var datesToGraph = [];
      var plotsInit = [];
      var chart;
      var resultArr = [];

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
      };

      // Executed when user presses a delete button
      $scope.removeStock = function (stockName, index) {

        if ($scope.moreThanOneLeft($scope.stocks)) {

          chart.unload({
            ids: [
              stockName
            ]
          });
          // Delete from front end array
          $scope.stocks.splice(index, 1);

          // Delete from back end array
          $http.delete('/api/stocks/' + stockName).success(function () {
          }).error(function (error) {
            console.log('delete error: ', error);
          });
        } else {
          console.log('wont delete because only 1 left');
        }
      };

      // Executed when user enters a stock code
      $scope.add = function () {

        // Make the user entry uppercase
        $scope.userTypedStockName = $scope.userTypedStockName.toUpperCase();

        if ($scope.stocks.indexOf($scope.userTypedStockName) === -1) {
          // User entered a valid stock code

          createQuandlQueryUrl($scope.userTypedStockName);

          $http.get(currentUrl)
            .success(function (data) {
              $scope.isLoading = true;

              var myData = data.dataset;

              // Make plot array
              makePlots(myData);

              chart.load({
                columns: [
                  myData.plots
                ]
              });

              // Post to front end array
              $scope.stocks.push($scope.userTypedStockName);

              // Post to back end array
              $http.post('/api/stocks', {name: $scope.userTypedStockName.toUpperCase()}).success(function () {
              }).error(function (error) {
                console.log(error);
              });

              clearUserInput();
              namesObjectifier(myData);
              chart.data.names(namesObject);

              $scope.isLoading = false;
            })
            .error(function (error) {
              // User entered a non-existent stock code
              console.log(error);
              showSimpleToast('Please enter a valid stock code.');
              clearUserInput();
            });

        } else {
          // User entered a stock code that is already present
          showSimpleToast('That stock is already on the graph.');
          clearUserInput();
        }
      }
    });

  })
  // Angular Material theme
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('amber');
  });

// TODO: Invalidate form if it is loading in graph to prevent it adding false stock code like YU when user is typing it in too fast
// TODO: Set other possible timeframes in tabs - currently at 6, potential for more
