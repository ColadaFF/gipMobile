(function () {
   "use strict";
   angular.module('sigip').factory("$$messages", function (ionicToast) {
      function simpleMessage(message) {
         ionicToast.show(message, 'bottom', false, 1500);
      }

      return {
         simpleMessage: simpleMessage
      };
   });
}());
