(function () {
   "use strict";
   function participantDetailsController(listServices) {
      var vm = this;
      vm.model = {
         participant: {},
         contact: {},
         relatives: {}
      };

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
            controller: ["$scope", "listServices", function ($scope, listServices) {
               listServices.getListValues('typeParticipant')
                  .then(function (data) {
                     var defaultArray = [{key: 'default', value: 'Seleccione'}];
                     $scope.to.options = defaultArray.concat(data.docs);
                     console.log($scope.to.options);
                  })
                  .catch(function (err) {
                     console.log(err.message);
                  });
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
               label: "Antiguedad del participante en el programa"
            }
         },
         {
            "key": "retirementDate",
            "type": "datePicker",
            "templateOptions": {
               "label": "Fecha de retiro"
            },
            "hideExpression": "model.status !== 'retired'"
         }
      ];

   }

   participantDetailsController.$inject = [];
   angular.module("sigip.controllers").controller("participantDetails", participantDetailsController)
}());
