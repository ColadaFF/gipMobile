(function () {
   "use strict";
   function controller(questions, $redux, _, $state) {
      var vm = this;
      vm.model = {};
      var fieldsArray = _.map(questions, function (question) {
         switch (_.get(question, 'type')) {
         case 'number':
            return {
               key: question.fieldName,
               type: 'input',
               templateOptions: {
                  label: question.title,
                  type: 'number'
               }
            };
         case 'text':
            return {
               key: question.fieldName,
               type: 'input',
               templateOptions: {
                  label: question.title,
                  type: 'text'
               }
            };
         case 'textArea':
            return {
               key: question.fieldName,
               type: 'textarea',
               templateOptions: {
                  placeholder: question.title
               }
            };
         case 'yesno':
            return {
               key: question.fieldName,
               type: 'toggle',
               templateOptions: {
                  label: question.title
               }
            };
         case 'multiChoice':
         case 'multiOptionSingleChoice':
         case 'multiOptionSingleChoiceWithOther':
         case 'multiChoiceWithOther':
            return {
               key: question.fieldName,
               type: 'select',
               templateOptions: {
                  label: question.title,
                  options: _.get(question, 'valueSource.values', []),
                  valueProp: 'key',
                  labelProp: 'value',
                  required: true
               }
            };

         default:
            return {}
         }
      });
      vm.fields = _.filter(fieldsArray, function (field) {
         console.log(_.keys(field));
         return _.keys(field).length > 0;
      });
      console.log(questions, fieldsArray, vm.fields);
      vm.viewSection = viewSection;

      function viewSection(section) {
         $redux.setAction("selectedSection", section);
         console.log(section);
      }
   }

   controller.$inject = ["questions", '$redux', '_', '$state'];

   angular.module('sigip.controllers').controller("surveyQuestionController", controller);
}());
