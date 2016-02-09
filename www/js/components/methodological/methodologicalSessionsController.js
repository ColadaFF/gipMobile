(function () {
   "use strict";
   function controller(activities, _, $rootScope, $ionicModal, Immutable, moment, $redux, $ObjectId, $methodologicalTracing, $log, $$messages) {
      var vm = this;
      var modalUpdateScope = $rootScope.$new();
      modalUpdateScope.model = {};
      modalUpdateScope.hideModal = hideModal;
      modalUpdateScope.saveUpdate = saveUpdate;
      modalUpdateScope.fields = [
         {
            key: 'date',
            "type": "datePicker",
            "templateOptions": {
               "label": "Fecha de realización",
               placeholder: "Presione aquí"
            }
         }
      ];
      vm.model = {};
      vm.saveMethodologicalTracing = saveMethodologicalTracing;
      var sessionsMap = Immutable.Map();
      vm.addReportData = addReportData;

      $ionicModal.fromTemplateUrl('templates/methodological/sessionReport.html', {
         scope: modalUpdateScope,
         animation: 'slide-in-up'
      }).then(function (modal) {
         modalUpdateScope.modal = modal;
      });

      vm.sessionsDone = _.filter(_.get(activities, 'sessions'), function (session) {
         return _.get(session, 'sessionData.reported', false) === true;
      });
      vm.sessionsDismissed = _.filter(_.get(activities, 'sessions'), function (session) {
         return _.get(session, 'sessionData.reported', false) === false;
      });

      function hideModal() {
         modalUpdateScope.modal.hide();
         modalUpdateScope.model = {};
      }

      function saveUpdate() {
         sessionsMap = sessionsMap.set(_.get(vm, 'selectedSession.sessionData._id'), modalUpdateScope.model);
         console.log(sessionsMap.toJS());
         modalUpdateScope.modal.hide();
      }

      function addReportData(session) {
         vm.selectedSession = session;
         modalUpdateScope.model = sessionsMap.get(session.sessionData._id) || {};
         modalUpdateScope.modal.show();
      }


      function sessionMapper(sessionsDone, sessionDismissed, type) {
         return {
            done: _
               .chain(sessionsDone)
               .filter(function (item) {
                  return item.activityType === type;
               })
               .map(function (item) {
                  var id = _.get(item, 'sessionData._id');
                  return _.assign({}, {
                     _id: id,
                     date: _.get(sessionsMap.get(id), 'date')
                  });
               })
               .value(),
            dismissed: _
               .chain(sessionDismissed)
               .filter(function (item) {
                  return item.activityType === type;
               })
               .map(function (item) {
                  return _.get(item, 'sessionData._id');
               })
               .value()
         };
      }

      function saveMethodologicalTracing() {
         var methodologicalDocument = _.assign({}, {
            _id: $ObjectId.generate(),
            creationDate: moment().toISOString(),
            location: _.get($redux.getAction("selectedLocation"), '_id'),
            year: moment().year(),
            month: moment().month(),
            details: {
               TrainingActivities: sessionMapper(vm.sessionsDone, vm.sessionsDismissed, 'Actividad Formativa'),
               familiarActivities: sessionMapper(vm.sessionsDone, vm.sessionsDismissed, 'Actividad con familiares del participante'),
               SportActivities: sessionMapper(vm.sessionsDone, vm.sessionsDismissed, 'Actividad Deportiva'),
               communityActivities: sessionMapper(vm.sessionsDone, vm.sessionsDismissed, 'Actividad Comunitaria'),
            }
         });
         $methodologicalTracing
            .put(methodologicalDocument)
            .then(function (response) {
               $$messages.simpleMessage("Seguimiento metodológico guardado correctamente");
               $log.info(response);
            })
            .catch($log.error);
      }
   }

   controller.$inject = ['activities', '_', '$rootScope', '$ionicModal', 'Immutable', 'moment', '$redux', '$ObjectId', '$methodologicalTracing', '$log', '$$messages'];
   angular.module('sigip.controllers').controller('methodologicalActivitiesCtlr', controller);
}());
