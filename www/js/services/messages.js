(function () {
   "use strict";
   angular.module('sigip').factory("$$messages", function (ionicToast) {
      function simpleMessage(message) {
         ionicToast.show(message, 'bottom', true, 200);
      }

      return {
         simpleMessage: simpleMessage
      };
   });
}());
