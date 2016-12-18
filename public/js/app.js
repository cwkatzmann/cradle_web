var app = angular.module('cradle', ['ngRoute']);

if (window.location.hash = "#_=_") {
    window.location.hash = "";
}

var newPhotos =
  $http({
      method: 'GET',
      url: '/profile/new'
    }).then(function(results){
      return results;
    });
  });

var allPhotos =
  $http({
      method: 'GET',
      url: '/profile/all'
    }).then(function(results){
      return results;
    });
  });

app.config(function($routeProvider) {
    $routeProvider.when('/', {
            templateUrl: 'static/partials/profile.html',
            controller: 'profileController',
        })
        .when('/scan', {
            templateUrl: 'static/partials/scan.html',
            controller: 'scanController',
        });
});

// app.factory('rawPhotosFactory', ['$http', function($http) {
//
//     var obj = {};
//
//     obj.rawPhotos = [];
//
//     obj.getRawPhotos = function() {
//       $http({
//           method: 'GET',
//           url: '/profile/new'
//         }).then(function(results){
//           obj.rawPhotos = results;
//         });
//     };
//
//
//     return obj;
//
// }]);


//service that holds onto raw photos value;

app.service('fbPhotosService', function(){
  var data = {};
  return {
    setData: function(res){
    data.photos = res.data.images;
    data.username = res.data.username;
    },
    getData: function(){
      return data;
    }
  }
})

// remember whether user is shipping off just new photos or all their photos
// app.service('fetchProperties', function(){
//   var fetchType = "new";
//   return {
//     setFetch: function(val){
//       fetchType = val;
//     },
//     getFetch: function(){
//       return fetchType;
//     }
//   };
// });

app.controller('profileController', ['$scope', '$http', 'photosService', function($scope, $http, rawPhotosFactory, fetchProperties) {
    $scope.view = {};
    $scope.view.loading = true;
    $scope.view.gotAll = false;

    fbPhotosService.setData(newPhotos);
    $scope.view.data = fbPhotosService.getData();

    $scope.setPhotosToAll = photosService.setPhotos(allPhotos);

    //^^^will this work with two way data binding? Above call to the service will not resolve right away because newPhotos is a promise.

    // rawPhotosFactory.getRawPhotos().then(function(response) {
    //   console.log(response);
    //     $scope.view.images = response.data.images;
    //     $scope.view.username = response.data.username;
    //     $scope.view.loading = false;
    //     // $scope.$digest();
    // });

    // rawPhotosFactory.getRawPhotos();
    // $scope.stuff = rawPhotosFactory.rawPhotos;
    //

    // $scope.getAllPhotos = function(){
    //   fetchProperties.setFetch('all');
    //   $http({
    //       method: 'GET',
    //       url: '/profile/all'
    //   }).then(function(response){
    //     $scope.view.images = response.data.images;
    //     $scope.view.gotAll = true;
    //     // $scope.$digest();
    //   })
    // }

}]);

app.controller('scanController', ['$scope', '$http', 'rawPhotosFactory', 'fetchProperties', function($scope, $http, rawPhotosFactory, fetchProperties) {

    $scope.view = {};
    $scope.view.loading = true;

    if (fetchProperties.getFetch() === "all"){
        console.log("scanning all the photos");
        $http({
            method: 'GET',
            url: '/profile/all'
        }).then(function(response){
          $http.post('/scan/all', response.data.images)
              .then(function success(response) {
                  $scope.view.response = response.data;
                  $scope.view.loading = false;
                  if ($scope.view.response.length > 0){
                    $scope.view.resultsFound = true;
                  } else {
                    $scope.view.resultsFound = false;
                  }
              }, function error(response) {
                  console.log('error');
              });
        })
    } else if (fetchProperties.getFetch() === "new"){
      rawPhotosFactory.getRawPhotos().then(function(response) {
        $http.post('/scan/new', response.data.images)
        .then(function success(response) {
          $scope.view.response = response.data;
          $scope.view.loading = false;
          if ($scope.view.response.length > 0){
            $scope.view.resultsFound = true;
          } else {
            $scope.view.resultsFound = false;
          }
        }, function error(response) {
          console.log('error');
        });
      });
    }



}])
