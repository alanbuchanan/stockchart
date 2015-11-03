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

    // TODO: init by taking the first item from the array and making a chart from it.
    // there should never be 0 entries in the array.
    // attach this gloally. then fetch the remaining entries in a separate get request

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

          // View url in console
          console.log(myData);

          var jsonArr = [];

          myData.data.forEach(function (element) {
            jsonArr.push({name: element[0], val: element[5]});
          });

          console.log(jsonArr);
          plotsInit = jsonArr;

          // Declare the c3 chart
          chart = c3.generate({
            data: {
              x: 'x',
              columns: [
                datesToGraph, myData.plots
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

          chart.load({
            columns: [
              myData.plots
            ]
          });

        })
        .error(function (error) {
          console.log(error);
        })
    });
    console.log('resultArr: ', resultArr);


    $scope.submitApiRequest = function () {
      console.log('hello from submit');
      $http.get(stocksUrls[0])
        .success(function (data) {

          var myData = data.dataset;

          // Make plot array
          myData.plots = [];
          myData.data.forEach(function (item) {
            myData.plots.push(item[5]);
          });

          myData.plots.unshift(myData.name);
          console.log('plots: ', myData.plots);

          // View url in console
          console.log(myData);

          var jsonArr = [];

          myData.data.forEach(function (element) {
            jsonArr.push({name: element[0], val: element[5]});
          });

          console.log(jsonArr);

          chart.load({
            columns: [
              myData.plots
            ]
          })

        })

        .error(function (err) {
          console.log('There was a problem: ', err);
        });
    };

    //submitApiRequest();

  });

// TODO: implement model to accept multiple stocks to chart
// TODO: Change number format from 8000000 to 8.0, or similar
// TODO: label 'val' to be the stock in question
// TODO: implement input and backend
