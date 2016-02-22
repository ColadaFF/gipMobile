(function () {
   "use strict";
   function controller(instances, $redux, _, $state) {
      var vm = this;
      vm.instances = _.get(instances, 'docs', []);
      vm.getStatusLabel = getStatusLabel;
      vm.surveyIcon = surveyIcon;
      vm.viewApplication = viewApplication;

      function viewApplication() {
         var survey = $redux.getAction('selectedSurvey');
         $state.go('app.surveySections', {
            "_id": survey._id
         });
      }

      function surveyIcon(survey) {
         return isAnon(survey) ? 'ion-ios-list' : 'ion-ios-body';
      }

      function getStatusLabel(status) {
         return status === 'complete' ? 'Completa' : 'Incompleta';
      }
   }

   controller.$inject = ["instances", '$redux', '_', '$state'];

   angular.module('sigip.controllers').controller("anonInstancesController", controller);
}());
