(function () {
   "use strict";
   function surveysCtlr(surveys, $redux, _, $state) {
      var vm = this;
      vm.surveys = _.get(surveys, 'docs', []);
      vm.getTypeLabel = getTypeLabel;
      vm.surveyIcon = surveyIcon;
      vm.applySurvey = applySurvey;

      function applySurvey(survey) {
         $redux.setAction("selectedSurvey", survey);
         console.log(survey);
         $state.go('app.anons');
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

   surveysCtlr.$inject = ["surveys", '$redux', '_', '$state'];

   angular.module('sigip.controllers').controller("surveysCtlr", surveysCtlr);
}());
