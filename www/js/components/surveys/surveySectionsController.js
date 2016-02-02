(function () {
   "use strict";
   function controller(sections, $redux, _, $state) {
      var vm = this;
      vm.sections = _.get(sections, 'docs', []);
      vm.survey = $redux.getAction('selectedSurvey');
      vm.viewSection = viewSection;

      function viewSection($event, section) {
         $event.preventDefault();
         $redux.setAction("selectedSection", section);
         $state.go('app.surveyQuestions', {idSection: _.get(section, '_id')});
      }
   }

   controller.$inject = ["sections", '$redux', '_', '$state'];

   angular.module('sigip.controllers').controller("surveySectionController", controller);
}());
