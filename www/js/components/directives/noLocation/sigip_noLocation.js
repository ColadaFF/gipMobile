(function () {
   "use strict";
   function sigip_noLocationCtlr($scope, $state, $redux) {
      $scope.goToLocations = goToLocations;
      $scope.locationSelected = locationSelected;


      function goToLocations() {
         $state.go("app.locations");
      }

      function locationSelected() {
         return $redux.checkStateAction('selectedLocation');
      }
   }

   sigip_noLocationCtlr.$inject = ["$scope", "$state", "$redux"];

   angular.module('sigip')
      .directive('sigipNoLocation', function () {
         return {
            restrict: 'E',
            controller: sigip_noLocationCtlr,
            scope: {},
            templateUrl: 'js/components/directives/noLocation/sigip_noLocation-template.html'
         };
      });
}());
