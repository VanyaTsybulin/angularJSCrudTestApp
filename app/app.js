/**
 * Created by vanya on 03.06.15.
 */
(function () {
    'use strict';
    var app = angular.module('app', ['ngRoute']);

    app.config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/mainPage.html',
                controller: 'mainPageController'
            })
            .when('/create', {
                templateUrl: 'views/createPage.html',
                controller: 'createPageController'
            })
            .when('/update/:id', {
                templateUrl: 'views/updatePage.html',
                controller: 'updatePageController'
            })
            .otherwise({
                redirectTo: '/'
            });
        })
        .controller('mainPageController', function (fetchDataServices, sharedProperties) {
            var ctrl = this;
            this.tempCheckedFile = null;
            ctrl.db = {};
            var refreshContent = function () {
                fetchDataServices.get('/get-customers', function (data) {
                    if (JSON.stringify(data) != JSON.stringify(ctrl.db)) {
                        ctrl.db = data;
                    }
                });
                setTimeout(refreshContent, 500);
            };
            refreshContent();
            //set default value for customer check value
            sharedProperties.setProperty();
            //need this to share checked file`s id for delete,update purposes
            this.setTempCheckedFile = function (input) {
                sharedProperties.setProperty(input.id);
            }

        })
        .controller('createPageController', function ($location, fetchDataServices) {
            this.userInfo = {};
            this.fetchResults = function () {
                fetchDataServices.send('/manage-customer', this.userInfo);
                $location.path('/');
            };
        })
        .controller('updatePageController', function ($location, $routeParams, fetchDataServices) {
            var ctrl = this;
            this.userInfo = {};
            var id = $routeParams.id;
            fetchDataServices.get('/manage-customer/' + id, function (data) {
                ctrl.userInfo = data;
            });
            this.fetchResults = function () {
                fetchDataServices.update('/manage-customer/', ctrl.userInfo);
                $location.path('/');
            };
        })
        .controller('navigationController', function ($location, fetchDataServices, sharedProperties) {
            this.deleteCustomer = function () {
                if (sharedProperties.getProperty() != null) {
                    fetchDataServices.delete('/manage-customer', sharedProperties.getProperty() );
                }
            };

            this.updateCustomer = function () {
                if (sharedProperties.getProperty() != null) {
                    $location.path("/update/" + sharedProperties.getProperty());
                }
            };
        })
        .filter('capitalize', function () {
            return function (input) {
                if (input != null) {
                    input = input.toLowerCase();
                    return input.substring(0, 1).toUpperCase() + input.substring(1);
                }
            }
        })
        .factory('fetchDataServices', function ($http, $location) {
            return {
                send: function (url, data) {
                    var data = JSON.stringify(data);
                    console.log(data);
                    $http({
                        method: 'POST',
                        url: url,
                        data: data
                    })
                },
                get: function (url, callback) {
                    var data = JSON.stringify(data);
                    $http({
                        method: 'GET',
                        url: url
                    }).success(
                        callback
                    )
                },
                delete: function (url, input) {
                    $http({
                        method: 'DELETE',
                        url: url + '/' + input
                    });
                },
                update: function (url, input) {
                    var data = JSON.stringify(input);
                    $http({
                        method: 'PUT',
                        url: url,
                        data: data
                    });
                }
            }
        })
        .service('sharedProperties', function () {
            var property = null;

            return {
                getProperty: function () {
                    return property;
                },
                setProperty: function (value) {
                    property = value;
                }
            };
        });
})();