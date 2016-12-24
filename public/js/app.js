var app = angular.module('cradle', ['ngRoute']);

if (window.location.hash === "#_=_") {
    window.location.hash = "";
}

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

//service that holds onto raw photos value;

app.service('fbPhotosService', ['$http', function($http){
  var data = {};

  return {
    setData: function(res, scanType){
    data.images = res.data.images;
    data.username = res.data.username;
    data.scanType = scanType;
    },
    getData: function(){
      return data;
    },
  };
}]);

app.controller('profileController', ['$scope', '$http', 'fbPhotosService', function($scope, $http, fbPhotosService) {
    $scope.view = {};
    $scope.view.loading = true;
    $scope.view.gotAll = false;

    $http({
        method: 'GET',
        url: '/profile/new'
      }).then(function(results){
        fbPhotosService.setData(results, 'new');
        $scope.view.data = results.data;
        $scope.view.loading = false;
      });

    $scope.getAllPhotos = function(){
      $http({
          method: 'GET',
          url: '/profile/all'
        }).then(function(results){
          fbPhotosService.setData(results, 'all');
          $scope.view.data = results.data;
          $scope.view.loading = false;
          $scope.view.gotAll = true;
        });
    };

}]);

app.controller('scanController', ['$scope', '$http', 'fbPhotosService', function($scope, $http, fbPhotosService) {

    $scope.view = {};
    $scope.view.loading = true;
    $scope.results = [];
    $scope.images = fbPhotosService.getData().images;

    $http.post('/scan/' + fbPhotosService.getData().scanType, $scope.images).then(function success(response) {
      response.data.forEach(function(obj){
        obj.body.faces.forEach(function(face){
        //structured this way instead of in one || for cases where one eye is null and the program will error when trying to access the leuko_prob of null
        if(face.left_eye){
          if (face.left_eye.leuko_prob >= 0.5) { $scope.results.push({face: face, url: obj.url});}
        }
        if(face.right_eye){
          if (face.right_eye.leuko_prob >= 0.5) { $scope.results.push({face: face, url: obj.url});}
        }
      });
    });
      $scope.view.loading = false;
      if ($scope.results.length > 0){
        $scope.view.resultsFound = true;
      } else {
        $scope.view.resultsFound = false;
      }
    }, function error(err) {
      console.log('error:', err);
    });

}]);
