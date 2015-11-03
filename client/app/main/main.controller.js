'use strict';

angular.module('stockchartApp')
  .controller('MainCtrl', function ($scope, $http) {
    //**************************************************************
    // Build a URL string for the query
    //**************************************************************
    var apiCall = {
      urlBase: {
        delimiter: '',
        name: 'https://www.quandl.com/api/v3/datasets'
      },
      quandlCategory: {
        delimiter: '/',
        name: 'WIKI'
      },
      stock: {
        delimiter: '/',
        name: 'AAPL'
      },
      apiFileType: {
        delimiter: '.',
        name: 'json'
      },
      startDate: {
        delimiter: '?',
        // TODO: Make the start date a date set to one month ago using Date object
        name: 'start_date=2015-10-01'
      },
      order: {
        delimiter: '&',
        name: 'order=asc'
      },
      //limit:{
      //  delimiter: '?',
      //  name: 'limit=20'
      //},
      apiKey: {
        delimiter: '&',
        name: 'api_key=zwfVKsRK7iy4KCdzcXaG'
      }
    };

    var apiArr = [];
    var apiCallUrl = '';

    Object.keys(apiCall).forEach(function (prop) {
      apiArr.push(apiCall[prop])
    });

    apiArr.forEach(function (element) {
      apiCallUrl += element.delimiter + element.name;
    });

    console.log(apiCallUrl);

    //**************************************************************
    // Request data from Quandl
    //**************************************************************
    $http.get(apiCallUrl)
      .success(function (data) {

        var myData = data.dataset;

        // Make dates array
        myData.dates = [];
        myData.data.forEach(function (item) {
          myData.dates.push(item[0]);
        });

        myData.dates.unshift('x');
        console.log('dates: ', myData.dates);

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

        // Declare the c3 chart
        var chart = c3.generate({
          data: {
            x: 'x',
            columns: [
              myData.dates,
              myData.plots
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

        setTimeout(function () {
          chart.load({
            columns: [
              ['data3', 400, 500, 450000, 7000000, 600, 50000000]
            ]
          });
        }, 3000);

        setTimeout(function () {
          chart.unload({
            ids: ['data3']
          });
        }, 3000);


        // Declare the c3 chart
        //var chart = c3.generate({
        //  data: {
        //    json: jsonArr,
        //    keys: {
        //      x: 'name',
        //      value: ['val']
        //    }
        //  },
        //  axis: {
        //    x: {
        //      type: 'timeseries',
        //      tick: {
        //        format: '%Y-%m-%d'
        //      }
        //    }
        //  }
        //});

      })
      .error(function (err) {
        console.log('There was a problem: ', err);
      });


  });

  // TODO: implement model to accept multiple stocks to chart
  // TODO: Change number format from 8000000 to 8.0, or similar
  // TODO: label 'val' to be the stock in question
  // TODO: implement input and backend
