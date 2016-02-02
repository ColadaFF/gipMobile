(function () {
   "use strict";
   function controller(instances, $redux, _, $state) {
      var vm = this;
      vm.instances = _.get(instances, 'docs', []);
      vm.getStatusLabel = getStatusLabel;
      vm.surveyIcon = surveyIcon;
      vm.viewApplication = viewApplication;

      function viewApplication(application) {
         $redux.setAction("selectedApplication", application);
         $state.go('app.surveySections', {
            "_id": application.survey
         });
         console.log(application);
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
