angular.module('sigipFormly', ['formly', 'ionic-datepicker'])
   .run(function (formlyConfig) {
      var templateSelect = "<select ng-model='model[options.key]'></select>";

      formlyConfig.setWrapper({
         name: 'labelSelect',
         templateUrl: 'js/formly/wrappers/labelSelect.html'
      });


      formlyConfig.setWrapper({
         name: 'labelRadio',
         templateUrl: 'js/formly/wrappers/labelRadio.html'
      });

      formlyConfig.setType({
         name: 'select',
         template: templateSelect,
         defaultOptions(options) {
            var ngOptions = options.templateOptions.ngOptions || `option[to.valueProp || 'value'] as option[to.labelProp || 'name'] group by option[to.groupProp || 'group'] for option in to.options`;
            return {
               ngModelAttrs: {
                  [ngOptions]: {
                     value: options.templateOptions.optionsAttr || 'ng-options'
                  }
               }
            };
         },
         wrapper: 'labelSelect'
      });

      formlyConfig.setType({
         name: 'datePicker',
         defaultOptions: {
            templateOptions: {
               datepickerOptions: {
                  weekDaysList: ["L", "M", "M", "J", "V", "S", "D"],
                  todayLabel: 'Hoy',
                  closeLabel: 'Cerrar',
                  setLabel: 'Guardar',
                  monthList: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Obtubre", "Noviembre", "Diciembre"],
                  dateFormat: 'DD/MM/YYYY'
               }
            }
         },
         controller: ["$scope", function ($scope) {
            $scope.to.datepickerOptions.titleLabel = $scope.to.label;
            $scope.to.datepickerOptions.callback = callback;

            function callback(val) {
               $scope.model[$scope.options.key] = val;
            }
         }],
         template: '<ionic-datepicker input-obj="to.datepickerOptions">' +
         '<button class="button button-block button-positive"> {{model[options.key] | amParse:"LL":"es"}}</button>' +
         '</ionic-datepicker>'
      });

      formlyConfig.setType({
         name: 'radio',
         templateUrl: 'js/formly/templates/radio.html',
         wrapper: 'labelSelect'
      });
   })
   .constant("moment", moment)
   .constant("_", _)
   .filter('amParse', ['moment', function (moment) {
      return function (value, format, locale) {
         if(!_.isUndefined(value)){
            return moment(value).locale(locale).format(format);
         }
      };
   }]);
