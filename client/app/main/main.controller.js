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
        name: 'MSFT'
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

        // Make plot array
        myData.plots = [];
        myData.data.forEach(function (item) {
          myData.plots.push(item[5]);
        });

        // View url in console
        console.log(myData);

        // Declare the c3 chart
        var chart = c3.generate({

          data: {
            json: {
              data1: myData.plots
            },
            keys: {
              x: myData.dates
            }
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
      })
      .error(function (err) {
        console.log('There was a problem: ', err);
      });


  });
