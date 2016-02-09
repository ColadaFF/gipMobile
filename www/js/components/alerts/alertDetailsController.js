(function () {
   "use strict";
   function controller(alert, _, $rootScope, $ionicModal, $alerts, $$messages, moment, $log) {
      var vm = this;
      var modalUpdateScope = $rootScope.$new();
      vm.alert = alert;
      vm.alertCode = _.get(alert, 'code');
      vm.getStatus = getStatus;
      vm.getFactor = getFactor;
      vm.getIntensity = getIntensity;
      vm.addUpdate = addUpdate;

      modalUpdateScope.model = {};
      modalUpdateScope.hideModal = hideModal;
      modalUpdateScope.saveUpdate = saveUpdate;
      modalUpdateScope.fields = [
         {
            "type": "select",
            "key": "status",
            "templateOptions": {
               "label": "Estado Alerta",
               options: [
                  {
                     name: 'Abierta',
                     value: 'open'
                  },
                  {
                     name: 'Cerrada',
                     value: 'close'
                  }
               ],
               valueProp: 'value',
               labelProp: 'name'
            }
         },
         {
            "type": "select",
            "key": "factor",
            "templateOptions": {
               "label": "Factor",
               options: [
                  {
                     name: 'Medio Ambiental',
                     value: 'ma'
                  },
                  {
                     name: 'Institucional',
                     value: 'inst'
                  },
                  {
                     name: 'Social / Comunitario',
                     value: 'social'
                  },
                  {
                     name: 'Seguridad',
                     value: 'security'
                  }
               ],
               valueProp: 'value',
               labelProp: 'name'
            }
         },
         {
            "type": "select",
            "key": "intensity",
            "templateOptions": {
               "label": "Intensidad",
               options: [
                  {
                     name: 'Verde',
                     value: 'green'
                  },
                  {
                     name: 'Amarillo',
                     value: 'yellow'
                  },
                  {
                     name: 'Naranja',
                     value: 'orange'
                  },
                  {
                     name: 'Rojo',
                     value: 'red'
                  }
               ],
               valueProp: 'value',
               labelProp: 'name'
            }
         },
         {
            key: 'description',
            type: 'textarea',
            templateOptions: {
               placeholder: "Ingrese una descripción de la actualización"
            }
         }
      ];

      function mapIntensity(intensity) {
         switch (intensity) {
         case 'green':
            return "Verde";
         case 'yellow':
            return "Amarillo";
         case 'orange':
            return "Naranja";
         case 'red':
            return "Rojo";
         }
      }

      function mapFactor(factor) {
         switch (factor) {
         case 'ma':
            return "Medio Ambiental";
         case 'inst':
            return "Institucional";
         case 'social':
            return "Social / Comunitario";
         case 'security':
            return "Seguridad";
         }
      }

      vm.mapperTo = {
         0: {
            "factor": "Medio Ambiental",
            "intensity": "Verde"
         },
         1: {
            "factor": "Medio Ambiental",
            "intensity": "Amarillo"
         },
         2: {
            "factor": "Medio Ambiental",
            "intensity": "Naranja"
         },
         3: {
            "factor": "Medio Ambiental",
            "intensity": "Rojo"
         },
         4: {
            "factor": "Institucional",
            "intensity": "Verde"
         },
         5: {
            "factor": "Institucional",
            "intensity": "Amarillo"
         },
         6: {
            "factor": "Institucional",
            "intensity": "Naranja"
         },
         7: {
            "factor": "Institucional",
            "intensity": "Rojo"
         },
         8: {
            "factor": "Social / Comunitario",
            "intensity": "Verde"
         },
         9: {
            "factor": "Social / Comunitario",
            "intensity": "Amarillo"
         },
         a: {
            "factor": "Social / Comunitario",
            "intensity": "Naranja"
         },
         b: {
            "factor": "Social / Comunitario",
            "intensity": "Rojo"
         },
         c: {
            "factor": "Seguridad",
            "intensity": "Verde"
         },
         d: {
            "factor": "Seguridad",
            "intensity": "Amarillo"
         },
         e: {
            "factor": "Seguridad",
            "intensity": "Naranja"
         },
         f: {
            "factor": "Seguridad",
            "intensity": "Rojo"
         }
      };

      $ionicModal.fromTemplateUrl('templates/alerts/modalUpdate.html', {
         scope: modalUpdateScope,
         animation: 'slide-in-up'
      }).then(function (modal) {
         modalUpdateScope.modal = modal;
      });

      function saveUpdate() {
         var toTransform = {
            factor: mapFactor(_.get(modalUpdateScope, 'model.factor')),
            intensity: mapIntensity(_.get(modalUpdateScope, 'model.intensity'))
         };
         var matrix = '';
         _.forOwn(vm.mapperTo, function (value, key) {
            if (_.isEqual(value, toTransform)) {
               matrix = key;
            }
         });
         var update = _.assign({}, {
            date: moment().toISOString(),
            details: {
               description: _.get(modalUpdateScope, 'model.description'),
               status: _.get(modalUpdateScope, 'model.status'),
               factor: mapFactor(_.get(modalUpdateScope, 'model.factor')),
               intensity: mapIntensity(_.get(modalUpdateScope, 'model.intensity')),
               matrix: matrix
            }
         });
         var alertUpdate = _.cloneDeep(alert);
         alertUpdate.timeLine.push(update);
         $alerts
            .put(alertUpdate)
            .then(function (response) {
               console.log(response);
               $alerts
                  .get(response.id)
                  .then(function (doc) {
                     vm.alert = doc;
                  })
                  .catch($log.error);
               $$messages.simpleMessage("Alerta actualizada correctamente");
               modalUpdateScope.modal.hide();
               modalUpdateScope.model = {};
            })
            .catch(function (err) {
               console.log(err);
            });
      }


      function hideModal() {
         modalUpdateScope.modal.hide();
         modalUpdateScope.model = {};
      }


      function addUpdate() {
         modalUpdateScope.modal.show();
      }

      function getStatus(alert) {
         return _.get(_.last(alert.timeLine), 'details.status') === 'close' ? "Cerrada" : "Abierta";
      }

      function getFactor(alert) {
         return _.get(_.last(alert.timeLine), 'details.factor');
      }

      function getIntensity(alert) {
         return _.get(_.last(alert.timeLine), 'details.intensity');
      }
   }

   controller.$inject = ["alert", '_', '$rootScope', '$ionicModal', '$alerts', '$$messages', 'moment', '$log'];
   angular.module('sigip.controllers').controller('alertDetailsCtlr', controller);
}());
