(function () {
   "use strict";
   ngModule.factory("$$messages", function ($mdToast) {
      function simpleMessage(message) {
         $mdToast.show(
            $mdToast.simple()
               .textContent(message)
               .hideDelay(3000)
         );
      }

      return {
         simpleMessage: simpleMessage
      };
   });
}());
