var app = angular.module('cradle', []);
app.controller('profileController', ['$scope', '$http', function($scope, $http){
    $scope.view = {};

    $http({
        method: 'GET',
        url: '/profile'
    }).then(function successCallback(response) {
        //if response.body.redirect is true, redirect browser to facebook login
        if(response.data.redirect){
          window.location = '/login';
        } else {
        //else render the first 10 photos, and amount of total new photos, then  present option to scan new photos
          $scope.view.photos = response.data.urls;
          $scope.view.username = response.data.username;
        }
    }, function errorCallback(response) {
      console.log('error');
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    $scope.scan = function(){
      var data = $scope.view.photos;
      $http.post('/scan', data).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log('error');
      });
    }

}])
