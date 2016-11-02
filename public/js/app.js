var app = angular.module('cradle', []);
app.controller('cradleController', ['$scope', '$http', function($scope, $http) {
    $scope.view = {};

    $http({
        method: 'GET',
        url: '/profile'
    }).then(function successCallback(response) {
      console.log(response);
        //if response.body.redirect is true, redirect browser to facebook login
        if(response.data.redirect){
          window.location = '/login';
        } else {
        //else render the first 10 photos, and amount of total new photos, then  present option to scan new photos
          console.log(response.data);
          $scope.view.newPhotos = response.data.photos;
        }
    }, function errorCallback(response) {
      console.log('error');
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

}])
