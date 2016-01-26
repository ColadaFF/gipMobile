(function () {
   "use strict";
   function participantsController(participants, moment, $redux, $state) {
      var vm = this;
      vm.getAge = getAge;
      vm.getStatusLabel = getStatusLabel;
      vm.selectParticipant = selectParticipant;
      if (participants === false) {
         vm.status = false;
      } else {
         vm.participants = participants;
      }


      function selectParticipant(participant) {
         $redux.setAction('selectedParticipant', participant);
         $state.go('app.participant');
      }

      function getAge(birthday) {
         if (!birthday) {
            return 'Desconocida';
         }
         return moment().diff(birthday, 'years');
      }

      function getStatusLabel(status) {
         return status === 'active' ? "Activo" : 'Inactivo';
      }
   }

   participantsController.$inject = ["participants", "moment", '$redux', '$state'];

   angular.module('sigip.controllers').controller("participantsCtlr", participantsController);
}());
