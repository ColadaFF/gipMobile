(function () {
   "use strict";
   function attendanceCtlr($redux, participants, $log) {
      var vm = this;
      vm.session = $redux.getAction('selectedSession');
      vm.participants = participants;
      vm.model = {};
      vm.openModal = openModal;
      vm.openPopover = openPopover;

      function openModal(participant) {
         $log.info("double", participant);
      }

      function openPopover(participant) {
         $log.info("single", participant);
      }
   }

   attendanceCtlr.$inject = ['$redux', 'participants', '$log'];
   angular.module("sigip").controller("attendanceCtlr", attendanceCtlr);
}());
