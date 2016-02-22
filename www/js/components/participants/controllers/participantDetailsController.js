(function () {
   "use strict";
   function participantDetailsController(listServices, $redux, lists, Sanitize$, $location_participants, $log, $contacts, $ObjectId, $$messages, $state) {
      var vm = this,
         selectDefaultValidator = {
            selectedDefault: {
               "expression": function (viewValue, modelValue) {
                  var value = modelValue || viewValue;
                  return value !== 'default';
               },
               "message": '"Debes seleccionar un valor de la lista."'
            }
         },
         labelsContact = {
            fields: {
               defaultOther: '\xbfCu\xE1l?',
               existId: '\xbfPresenta identificaci\xf3n?',
               idType: 'Tipo de identificaci\xf3n',
               idNumber: 'Nº de identificaci\xf3n',
               lastname: 'Apellidos',
               name: 'Nombres',
               birthday: 'Fecha de nacimiento',
               actuallyPregnancy: '\xbfEst\xe1 en embarazo?',
               pregnancyBirthday: 'Fecha probable de parto',
               gender: 'G\xe9nero',
               phone: 'Tel\xe9fono fijo',
               mobile: 'Tel\xe9fono celular',
               militaryCard: '\xbflibreta militar?',
               ethnicGroup: 'Grupo \xe9tnico',
               rhType: 'RH',
               maritalStatus: 'Estado civil',
               address: 'Direcci\xf3n',
               actualActivity: 'Actividad actual',
               sisben: '\xbfPosee SISBEN?',
               sisbenNumber: 'N\xfamero de ficha del sisben',
               sisbenScore: 'Puntaje de sisben',
               healthRegime: 'R\xe9gimen de salud',
               healthServiceEntity: 'Entidad del servicio'
            },
            options: {
               defaultSelect: 'Seleccione un valor de la lista',
               yes: 'S\xed',
               no: 'No',
               process: 'En trámite',
               men: 'Hombre',
               women: 'Mujer',
               male: 'Masculino',
               female: 'Femenino',
               other: 'Otro'
            },
            defaults: {
               placeholderInput: 'Presione aqu\xed para escribir texto'
            }
         },
         currentParticipant = $redux.getAction('selectedParticipant'),
         contactModel = _.get(currentParticipant, 'id', {});
      vm.model = {
         participant: currentParticipant ? _.set(currentParticipant, 'typeParticipant', _.get(currentParticipant, 'type.key')) : {},
         contact: Sanitize$.cleanModel(contactModel)
      };
      vm.relatives = _.get(currentParticipant, 'id.relatives', []);

      function controllerBase(scope, nameList) {
         scope.to.options = _.filter(lists, {name: nameList});
      }

      vm.fieldsParticipant = [
         {
            key: 'typeParticipant',
            type: 'select',
            templateOptions: {
               label: "Tipo",
               options: [],
               valueProp: 'key',
               labelProp: 'value',
               required: true
            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, "typeParticipant")
            }]
         },
         {
            "type": "select",
            "key": "status",
            "templateOptions": {
               "label": "Estado",
               options: [
                  {
                     name: 'Activo',
                     value: 'active'
                  },
                  {
                     name: 'Inactivo',
                     value: 'inactive'
                  },
                  {
                     name: 'Retirado',
                     value: 'retired'
                  }
               ],
               valueProp: 'value',
               labelProp: 'name'
            }
         },
         {
            key: 'permanenceParticipant',
            type: 'datePicker',
            templateOptions: {
               label: "Antiguedad del participante",
               placeholder: "Presione aquí"
            }
         },
         {
            "key": "retirementDate",
            "type": "datePicker",
            "templateOptions": {
               "label": "Fecha de retiro",
               placeholder: "Presione aquí"
            },
            "hideExpression": "model.status !== 'retired'"
         }
      ];

      vm.fieldsContact = [
         {
            key: 'existId',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.existId,
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.yes},
                  {key: '2', value: labelsContact.options.no},
                  {key: '3', value: labelsContact.options.process}
               ],
               valueProp: 'key',
               labelProp: 'value',
               "required": true

            },
            validators: selectDefaultValidator
         },
         {
            key: 'idType',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.idType,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value',
               "required": true
            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'idType');
            }],
            validators: selectDefaultValidator
         },
         {
            key: 'idNumber',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.idNumber,
               placeholder: labelsContact.defaults.placeholderInput,
               required: true
            }
         },
         {
            key: 'lastname',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.lastname,
               placeholder: labelsContact.defaults.placeholderInput,
               "required": true
            }
         },
         {
            key: 'name',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.name,
               placeholder: labelsContact.defaults.placeholderInput,
               "required": true
            }
         },
         {
            key: 'birthday',
            type: 'datePicker',
            templateOptions: {
               label: labelsContact.fields.birthday
            }
         },
         {
            key: 'genderSex',
            type: 'select',
            templateOptions: {
               label: 'Sexo',
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.men},
                  {key: '2', value: labelsContact.options.women}
               ],
               valueProp: 'key',
               labelProp: 'value',
               "required": true
            },
            validators: selectDefaultValidator
         },
         {
            key: 'actuallyPregnancy',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.actuallyPregnancy,
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.yes},
                  {key: '2', value: labelsContact.options.no}
               ],
               valueProp: 'key',
               labelProp: 'value'
            },
            "hideExpression": "model.genderSex !== '2'"
         },
         {
            key: 'pregnancyBirthday',
            type: 'datePicker',
            templateOptions: {
               label: labelsContact.fields.pregnancyBirthday
            },
            "hideExpression": "model.actuallyPregnancy !== '1'"
         },
         {
            key: 'gender',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.gender,
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.male},
                  {key: '2', value: labelsContact.options.female},
                  {key: '3', value: labelsContact.options.other}
               ],
               valueProp: 'key',
               labelProp: 'value'
            }
         },
         {
            key: 'genderOther',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.defaultOther,
               placeholder: labelsContact.defaults.placeholderInput
            },
            hideExpression: "model.gender !== '3'"
         },
         {
            key: 'phone',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.phone,
               placeholder: labelsContact.defaults.placeholderInput
            }
         },
         {
            key: 'mobile',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.mobile,
               placeholder: labelsContact.defaults.placeholderInput
            }
         },
         {
            key: 'militaryCard',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.militaryCard,
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.yes},
                  {key: '2', value: labelsContact.options.no}
               ],
               valueProp: 'key',
               labelProp: 'value'

            },
            hideExpression: "!model.birthday || vm.getYears(model.birthday) < 18 || model.genderSex !== '1'"
         },
         {
            key: 'rhType',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.rhType,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value'

            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'rH');
            }]
         },
         {
            key: 'maritalStatus',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.maritalStatus,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value',
               "required": true

            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'maritalStatus');
            }],
            validators: selectDefaultValidator
         },
         {
            key: 'address',
            type: 'input',
            "ngModelAttrs": {
               "dataToggle": {
                  attribute: "data-toggle"
               },
               dataPlacement: {
                  "attribute": "data-placement"
               },
               "title": {
                  "attribute": "title"
               },
               "dataContent": {
                  "attribute": "data-content"
               },
               "dataTrigger": {
                  "attribute": "data-trigger"
               }
            },
            templateOptions: {
               type: "text",
               label: labelsContact.fields.address,
               placeholder: labelsContact.defaults.placeholderInput,
               "dataToggle": "popover",
               "dataPlacement": "top",
               "title": "Atenci\xf3n",
               "dataContent": "Si no tiene nomenclatura, ingrese una ubicaci\xf3n de referencia.",
               "dataTrigger": "focus"
            }
         },
         {
            key: 'actualActivity',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.actualActivity,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value'

            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'actualActivity');
            }]
         },
         {
            key: 'sisben',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.sisben,
               placeholder: 'Seleccione..',
               options: [
                  {key: 'default', value: labelsContact.options.defaultSelect},
                  {key: '1', value: labelsContact.options.yes},
                  {key: '2', value: labelsContact.options.no}
               ],
               valueProp: 'key',
               labelProp: 'value'
            }
         },
         {
            key: 'sisbenNumber',
            type: 'input',
            templateOptions: {
               type: "text",
               label: labelsContact.fields.sisbenNumber,
               placeholder: labelsContact.defaults.placeholderInput
            },
            "hideExpression": "model.sisben !== '1'"
         },
         {
            key: 'sisbenScore',
            type: 'maskedInput',
            templateOptions: {
               label: labelsContact.fields.sisbenScore,
               placeholder: labelsContact.defaults.placeholderInput,
               mask: '9999'

            },
            "hideExpression": "model.sisben !== '1'"
         },
         {
            key: 'ethnicGroup',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.ethnicGroup,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value'
            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'ethnic');
            }]
         },
         {
            key: 'ethnicGroupOther',
            type: 'input',
            templateOptions: {
               label: labelsContact.fields.defaultOther,
               placeholder: labelsContact.defaults.placeholderInput
            },
            hideExpression: "model.ethnicGroup !== 'other'"
         },
         {
            key: 'healthRegime',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.healthRegime,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value'

            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'healthRegime');
            }]
         },
         {
            key: 'healthServiceEntity',
            type: 'select',
            templateOptions: {
               label: labelsContact.fields.healthServiceEntity,
               placeholder: 'Seleccione..',
               options: [],
               valueProp: 'key',
               labelProp: 'value'

            },
            controller: ["$scope", function ($scope) {
               controllerBase($scope, 'healthServiceEntity');
            }],
            hideExpression: "model.healthRegime === '4' || model.healthRegime === '3' || model.healthRegime === 'default'"
         }
      ];

      vm.saveModel = function () {
         if (_.keys(currentParticipant) < 1) {
            var contactID = $ObjectId.generate();
            var participantId = $ObjectId.generate();
            var contactModel = _.set(vm.model.contact, '_id', contactID);
            var location = $redux.getAction('selectedLocation');
            var participantModel = _.clone(vm.model.participant);
            console.log(contactModel);
            $contacts
               .put(contactModel)
               .then(function (responseContact) {
                  $log.info(responseContact);
                  $location_participants
                     .put(_.assign(participantModel, {
                        'id': contactID,
                        '_id': participantId,
                        'programLocation': location._id
                     }))
                     .then(function (response) {
                        $$messages.simpleMessage("Participante creado correctamente");
                        $log.info(response);
                        console.log(participantModel);
                        $state.go('app.participants');
                     })
                     .catch($log.error);
               })
               .catch($log.error);
         } else {
            $contacts
               .put(vm.model.contact)
               .then(function (responseContact) {
                  $log.info(responseContact);
                  $location_participants
                     .put(_.set(vm.model.participant, 'id', currentParticipant._id))
                     .then(function (response) {
                        $$messages.simpleMessage("Participante creado correctamente");
                        $log.info(response);
                        $state.go('app.participants');
                     })
                     .catch($log.error);
               })
               .catch($log.error);
         }
      };
   }

   participantDetailsController.$inject = ["listServices", "$redux", "lists", 'Sanitize$', '$location_participants', '$log', '$contacts', '$ObjectId', '$$messages', '$state'];
   angular.module("sigip.controllers").controller("participantDetails", participantDetailsController)
}());
