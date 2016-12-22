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
    setData: function(res){
    data.images = res.data.images;
    data.username = res.data.username;
    },
    getData: function(){
      return data;
    }
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
        console.log('the service ran');
        fbPhotosService.setData(results);
        console.log(results);
        $scope.view.data = results.data;
        $scope.view.loading = false;
        $scope.view.gotAll = true;
      });

    $scope.getAllPhotos = function(){
      $http({
          method: 'GET',
          url: '/profile/all'
        }).then(function(results){
          fbPhotosService.setData(results);
          console.log('the service ran');
          $scope.view.data = results.data;
          $scope.view.loading = false;
          $scope.view.gotAll = true;
        });
    };

}]);

app.controller('scanController', ['$scope', '$http', 'fbPhotosService', function($scope, $http, fbPhotosService) {

    $scope.view = {};
    $scope.view.loading = true;

    var images = fbPhotosService.getData().images;

    console.log("sent a scan request");
    $http.post('/scan/all', images).then(function success(response) {
      console.log(response);
      var filteredData = response.data.filter(function(obj){
        obj.body.faces.forEach(function(face){
          console.log(face);
          var match = false;
          if(face.left_eye){
            if (face.left_eye.leuko_prob >= 0.5) { match = true;}
          }
          if(face.right_eye){
            if (face.right_eye.leuko_prob >= 0.5) { match = true;}
          }
          return match;
        });
      });

      $scope.view.response = filteredData;
      $scope.view.loading = false;
      if ($scope.view.response.length > 0){
        $scope.view.resultsFound = true;
      } else {
        $scope.view.resultsFound = false;
      }
    }, function error(response) {
      console.log('error');
    });

}]);
