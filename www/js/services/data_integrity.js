(function () {
   "use strict";
   var ngModule = angular.module('sigip');

   function sanitizeFactory(_, moment) {
      function cleanModel(model) {

         function isEmpty(value) {
            return _.isString(value) && ( _.isEqual(value, '') || _.isEqual(value, 'null'));
         }

         var newModel = {};
         _.forOwn(model, function (value, key) {
            if (!_.isNull(value) && !_.isUndefined(value) && !isEmpty(value)) {
               if (!_.isObject(value) && !_.isArray(value) && !moment.isDate(value)) {
                  newModel = _.set(newModel, key, String(value));
               } else {
                  newModel = _.set(newModel, key, value);
               }
            }
         });
         return newModel;
      }

      return {
         cleanModel: cleanModel
      };
   }

   sanitizeFactory.$inject = ["_", 'moment'];
   ngModule.factory("Sanitize$", sanitizeFactory);
}());
