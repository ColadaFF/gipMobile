(function () {
   "use strict";
   function surveysCtlr(surveys, $redux) {
      var vm = this;
      vm.surveys = surveys;
      vm.getTypeLabel = getTypeLabel;
      vm.surveyIcon = surveyIcon;
      vm.applySurvey = applySurvey;

      function applySurvey(survey) {
         $redux.setAction("selectedSurvey", survey);
         console.log(survey);
      }

      function surveyIcon(survey) {
         return isAnon(survey) ? 'ion-ios-list' : 'ion-ios-body';
      }

      function getTypeLabel(survey) {
         return isAnon(survey) ? 'Anónima' : 'Participantes';
      }

      function isAnon(survey) {
         return _.get(survey, 'anonymous', false);
      }
   }

   surveysCtlr.$inject = ["surveys", '$redux'];

   angular.module('sigip.controllers').controller("surveysCtlr", surveysCtlr);
}());
