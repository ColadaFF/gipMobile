(function () {
   "use strict";
   function activitiesController(activities, $redux, $log, $state) {
      var vm = this;
      vm.activities = activities;
      vm.selectSession = selectSession;
      vm.getIconActivityType = getIconActivityType;
      function getIconActivityType(type) {
         switch (type) {
         case 'Actividad Formativa':
            return 'ion-paintbrush';
         case 'Actividad con familiares del participante':
            return 'ion-person-stalker';
         case 'Actividad Deportiva':
            return 'ion-ios-football';
         case 'Actividad Comunitaria':
            return 'ion-ios-people';
         }
      }

      function selectSession(session) {
         $log.info(session);
         $redux.setAction("selectedSession", session);
         $state.go('app.attendance');
      }
   }

   activitiesController.$inject = ['activities', '$redux', "$log", "$state"];

   angular.module('sigip.controllers').controller("activitiesCtlr", activitiesController);
}());
