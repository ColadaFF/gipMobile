(function () {
  "use strict";
  function locationsCtlr(locations, $redux) {
    var vm = this;
    vm.locations = locations.rows;
    vm.saveCurrentLocation = saveCurrentLocation;
    console.log("Hi there   ", vm.locations);

    function saveCurrentLocation(location) {
      $redux.setAction("selectedLocation", location.key);
    }
  }

  locationsCtlr.$inject = ["locations", "$redux"];

  angular.module('sigip.controllers').controller("locationsCtlr", locationsCtlr);
}());
