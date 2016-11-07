var app = angular.module('cradle', ['ngRoute']);


if (window.location.hash = "#_=_") {
    window.location.hash = "";
}

app.config(function($routeProvider) {
    $routeProvider.when('/', {
            templateUrl: 'static/partials/profile.html', //do we need static?
            controller: 'profileController',
        })
        .when('/scan', {
            templateUrl: 'static/partials/scan.html', //do we need static?
            controller: 'scanController',
        });
});

app.factory('rawPhotosFactory', ['$http', function($http) {

    var obj = {};

    obj.getRawPhotos = function() {

        return new Promise(function(resolve, reject) {

            $http({
                method: 'GET',
                url: '/profile/new'
            }).then(function success(response) {
                //if response.body.redirect is true, the FB OAuth token has expired, so redirect browser to facebook login.
                if (response.data.redirect) {
                    window.location = '/login';
                } else {
                    //return all of the response data to be used in both controllers
                    console.log(response);
                    resolve(response);
                }
            }, function error(response) {
                console.log('error');
                reject(response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        });
    };

    return obj;

}]);


// remember whether user is shipping off just new photos or all their photos
app.service('fetchProperties', function(){
  var fetchType = "new";
  return {
    setFetch: function(val){
      fetchType = val;
    },
    getFetch: function(){
      return fetchType;
    }
  }
})

app.controller('profileController', ['$scope', '$http', 'rawPhotosFactory', 'fetchProperties', function($scope, $http, rawPhotosFactory, fetchProperties) {
    $scope.view = {};
    $scope.view.loading = true;

    rawPhotosFactory.getRawPhotos().then(function(response) {
        $scope.view.images = response.data.images;
        $scope.view.username = response.data.username;
        $scope.view.loading = false;
        $scope.$digest();
    });

    $scope.getAllPhotos = function(){
      fetchProperties.setFetch('all');
      $http({
          method: 'GET',
          url: '/profile/all'
      }).then(function(response){
        $scope.view.images = response.data.images;
        // $scope.$digest();
      })
    }

}]);

app.controller('scanController', ['$scope', '$http', 'rawPhotosFactory', 'fetchProperties', function($scope, $http, rawPhotosFactory, fetchProperties) {

    $scope.view = {};
    $scope.view.loading = true;
    $scope.view.gotAll = false;

    if (fetchProperties.getFetch() === "all"){
        console.log("scanning all the photos");
        $http({
            method: 'GET',
            url: '/profile/all'
        }).then(function(response){
          $http.post('/scan/all', response.data.images)
              .then(function success(response) {
                  $scope.view.response = response.data;
                  console.log("$scope.view.response", $scope.view.response);
                  $scope.view.loading = false;
              }, function error(response) {
                  console.log('error');
              });
        })
    } else if (fetchProperties.getFetch() === "new"){
      rawPhotosFactory.getRawPhotos().then(function(response) {
        $http.post('/scan/new', response.data.images)
        .then(function success(response) {
          console.log(response);
          $scope.view.response = response.data;
          $scope.view.loading = false;
        }, function error(response) {
          console.log('error');
        });
      });
    }

}])
