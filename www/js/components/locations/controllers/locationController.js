(function () {
   "use strict";
   function locationsCtlr(locations, $redux, _, $$messages) {
      var vm = this;
      vm.locations = locations;
      vm.saveCurrentLocation = saveCurrentLocation;
      vm.getStatusLabel = getStatusLabel;
      vm.checkSelectedLocation = checkSelectedLocation;

      function saveCurrentLocation(location) {
         $redux.setAction("selectedLocation", location);
         var message = _.template("Ubicación <%=location %> ha sido seleccionada");
         $$messages.simpleMessage(message({location: _.get(location, 'location.value')}));

      }

      function getStatusLabel(status) {
         return status === 'active' ? "Activa" : 'Inactiva';
      }

      function checkSelectedLocation(location) {
         return _.isEqual(location, $redux.getAction("selectedLocation"));
      }
   }

   locationsCtlr.$inject = ["locations", "$redux", '_', '$$messages'];

   angular.module('sigip.controllers').controller("locationsCtlr", locationsCtlr);
}());
