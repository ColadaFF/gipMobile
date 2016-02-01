(function () {
   "use strict";
   function attendanceCtlr($redux, participants, $log, Immutable, $ionicModal, $rootScope, $ObjectId, _, $attendance, $$messages, attendanceDoc) {
      console.log(attendanceDoc);
      var vm = this;
      vm.session = $redux.getAction('selectedSession');
      vm.attendanceType = checkAttendanceType(vm.session);
      vm.participants = formatAttendance(participants, vm.attendanceType);
      vm.model = {};
      vm.modelGuardians = {};
      vm.modelComments = Immutable.Map();
      vm.openModal = openModal;
      vm.openPopover = openPopover;
      var modalScope = $rootScope.$new();
      modalScope.model = {};
      modalScope.fields = [
         {
            key: 'comment',
            type: 'input',
            templateOptions: {
               type: "text",
               label: "Comentarios",
               required: true
            }
         }
      ];
      vm.saveAttendance = saveAttendance;
      console.log(_.size(attendanceDoc.docs));
      if (_.size(attendanceDoc.docs) > 0) {
         _.each(attendanceDoc.docs[0].attendance, function (participant) {
            var participantIndex = _.findIndex(vm.participants, function (data) {
               return _.isEqual(_.get(data, 'id._id'), participant._id);
            });
            vm.model = _.set(vm.model, vm.participants[participantIndex]._id, _.get(participant, 'attend', false));
            vm.modelGuardians = _.set(vm.modelGuardians, vm.participants[participantIndex]._id, _.get(participant, 'guardian.attend', false));
            vm.modelComments = vm.modelComments.set(vm.participants[participantIndex]._id, _.get(participant, 'comment'));

         });
         vm.exists = true;
      }

      function saveAttendance() {
         var attendanceModelToSave = {
            "_id": $ObjectId.generate(),
            "activityName": vm.session.activityNameID,
            "activityType": vm.session.activityTypeID,
            "session": vm.session.sessionId
         };
         var attendance = [];
         switch (vm.attendanceType) {
         case 1:
            attendance = _.map(vm.participants, function (participant, index) {
               return _.assign({}, {
                  "consecutive": index + 1,
                  "name": _.get(participant, 'id.name'),
                  "lastname": _.get(participant, 'id.lastname'),
                  "idNumber": _.get(participant, 'id.idNumber'),
                  "_id": _.get(participant, 'id._id'),
                  "attend": _.get(vm.model, participant._id, false),
                  "comment": vm.modelComments.get(participant._id)
               });
            });
            attendanceModelToSave = _.merge(attendanceModelToSave, {attendance: attendance});
            break;
         case 2:
            attendance = _.map(vm.participants, function (participant, index) {
               return _.assign({}, {
                  "consecutive": index + 1,
                  "name": _.get(participant, 'id.name'),
                  "lastname": _.get(participant, 'id.lastname'),
                  "idNumber": _.get(participant, 'id.idNumber'),
                  "_id": _.get(participant, 'id._id'),
                  "attend": _.get(vm.model, participant._id, false),
                  "comment": vm.modelComments.get(participant._id),
                  "guardian": {
                     "attend": _.get(modelGuardians, participant._id, false),
                     "id": {
                        "idNumber": _.get(participant, 'guardian.id.idNumber'),
                        "name": _.get(participant, 'guardian.id.name'),
                        "lastname": _.get(participant, 'guardian.id.lastname'),
                        "_id": _.get(participant, 'guardian.id._id')
                     }
                  }
               });
            });
            attendanceModelToSave = _.merge(attendanceModelToSave, {attendance: attendance});
            break;
         case 3:
            attendance = _.map(vm.participants, function (participant, index) {
               return _.assign({}, {
                  "consecutive": index + 1,
                  "name": _.get(participant, 'id.name'),
                  "lastname": _.get(participant, 'id.lastname'),
                  "idNumber": _.get(participant, 'id.idNumber'),
                  "_id": _.get(participant, 'id._id'),
                  "comment": vm.modelComments.get(participant._id),
                  "guardian": {
                     "attend": _.get(modelGuardians, participant._id, false),
                     "id": {
                        "idNumber": _.get(participant, 'guardian.id.idNumber'),
                        "name": _.get(participant, 'guardian.id.name'),
                        "lastname": _.get(participant, 'guardian.id.lastname'),
                        "_id": _.get(participant, 'guardian.id._id')
                     }
                  }
               });
            });
            attendanceModelToSave = _.merge(attendanceModelToSave, {attendance: attendance});
            break;
         case 0:
            attendanceModelToSave = _.merge(attendanceModelToSave, {attendance: vm.model.attendance});
            break;
         }
         $attendance
            .put(attendanceModelToSave)
            .then(function (response) {
               $$messages.simpleMessage("Asistencia guardada correctamente.");
               $log.info("success", response);
            })
            .catch(function (err) {
               $$messages.simpleMessage("Error al guardar la asistencia, intente nuevamente más tarde.");
               $log.error("error", err);
            });
      }

      $ionicModal.fromTemplateUrl('templates/activities/attendance_participant_comment.html', {
         scope: modalScope,
         animation: 'slide-in-up'
      }).then(function (modal) {
         modalScope.modal = modal;

         modalScope.openModal = function () {
            modalScope.modal.show();
         };
         modalScope.closeModal = function (result) {
            modalScope.modal.hide();
         };
         modalScope.saveComment = function (model) {
            vm.modelComments = vm.modelComments.set(modalScope.participant._id, _.get(model, 'comment'));
            $log.info(model, vm.modelComments.toJS());
            modalScope.modal.hide();
         };
         modalScope.$on('modal.hidden', function (thisModal) {
            modalScope.model = _.set(modalScope.model, 'comment', '');
         });
      });


      function openModal(participant) {
         modalScope.participant = participant;
         modalScope.model = _.set(modalScope.model, 'comment', vm.modelComments.has(participant._id) ? vm.modelComments.get(participant._id) : '');
         modalScope.modal.show();
      }

      function openPopover(participant) {
         vm.selectedParticipant = participant;
         $log.info("single", participant);
      }


      function checkAttendanceType(session) {
         switch (session.activityType) {
         case 'Actividad Formativa':
         case 'Actividad Deportiva':
            return 1;
         case 'Actividad con familiares del participante':
            if (_.isEqual(session.activityName, 'Encuentro padres de familia')) {
               return 3;
            }
            return 2;
         case 'Actividad Comunitaria':
            return 0;
         }
      }

      function formatAttendance(participants, type) {
         switch (type) {
         case 1:
            return participants;
         case 2:
         case 3:
            return _.map(participants, function (participant) {
               var indexGuardian = _.findIndex(participant.id.relatives, 'guardian');
               if (_.size(participant.id.relatives) === 0) {
                  return _.set(participant, 'guardian', null);
               } else {
                  if (indexGuardian === -1) {
                     return _.set(participant, 'guardian', _.sampleSize(participant.id.relatives, 1));
                  } else {
                     return _.set(participant, 'guardian', participant.id.relatives[indexGuardian]);
                  }
               }
            });
         case 0:
            return [];
         }
      }
   }

   attendanceCtlr.$inject = ['$redux', 'participants', '$log', 'Immutable', '$ionicModal', '$rootScope', '$ObjectId', '_', '$attendance', '$$messages', 'attendanceDoc'];
   angular.module("sigip").controller("attendanceCtlr", attendanceCtlr);
}());
