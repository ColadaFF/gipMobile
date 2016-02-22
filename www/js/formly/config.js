angular.module('sigipFormly', ['formly', 'ionic-datepicker', 'ngMask'])
   .run(function (formlyConfig) {
      var templateSelect = "<select ng-model='model[options.key]'></select>";

      function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

      function select(options) {
         var ngOptions = options.templateOptions.ngOptions || "option[to.valueProp || 'value'] as option[to.labelProp || 'name'] group by option[to.groupProp || 'group'] for option in to.options";
         return {
            ngModelAttrs: _defineProperty({}, ngOptions, {
               value: options.templateOptions.optionsAttr || 'ng-options'
            })
         };
      }

      formlyConfig.setWrapper({
         name: 'labelSelect',
         templateUrl: 'js/formly/wrappers/labelSelect.html'
      });

      formlyConfig.setWrapper({
         name: 'labelDateTime',
         templateUrl: 'js/formly/wrappers/dateTimePicker.html'
      });

      formlyConfig.setWrapper({
         name: 'labelRadio',
         templateUrl: 'js/formly/wrappers/labelRadio.html'
      });

      formlyConfig.setWrapper({
         name: 'labelIonic',
         templateUrl: 'js/formly/wrappers/wrapper_default.html'
      });

      formlyConfig.setType({
         name: 'input',
         templateUrl: 'js/formly/templates/input.html',
         wrapper: 'labelIonic'
      });

      formlyConfig.setType({
         name: 'textarea',
         templateUrl: 'js/formly/templates/textarea.html'
      });

      formlyConfig.setType({
         name: 'toggle',
         templateUrl: 'js/formly/templates/toggle.html'
      });

      formlyConfig.setType({
         name: 'select',
         template: templateSelect,
         defaultOptions: select,
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
               },
               placeholder: "Presione aquí"
            }
         },
         controller: ["$scope", function ($scope) {
            $scope.to.datepickerOptions.titleLabel = $scope.to.label;
            $scope.to.datepickerOptions.callback = callback;

            function callback(val) {
               $scope.model[$scope.options.key] = val;
            }
         }],
         wrapper: 'labelDateTime',
         templateUrl: "js/formly/templates/dateTimePicker.html"
      });

      formlyConfig.setType({
         name: 'radio',
         templateUrl: 'js/formly/templates/radio.html',
         wrapper: 'labelSelect'
      });

      formlyConfig.setType({
         name: 'maskedInput',
         extends: 'input',
         defaultOptions: {
            ngModelAttrs: { // this is part of the magic... It's a little complex, but super powerful
               mask: { // the key "ngMask" must match templateOptions.ngMask
                  attribute: 'mask' // this the name of the attribute to be applied to the ng-model in the template
               },
               // applies the 'clean' attribute with the value of "true"
               'true': {
                  value: 'clean'
               },
               limit: {
                  attribute: 'limit'
               },
               validate: {
                  attribute: 'validate'
               },
               restrict: {
                  attribute: 'restrict'
               },
               repeat: {
                  attribute: 'repeat'
               }
            }
         }
      });
   })
   .constant("moment", moment)
   .constant("_", _)
   .filter('amParse', ['moment', function (moment) {
      return function (value, format, locale) {
         if (!_.isUndefined(value)) {
            return moment(value).locale(locale).format(format);
         }
      };
   }]);
