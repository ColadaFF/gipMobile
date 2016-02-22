(function () {
   "use strict";
   angular.module("sigip").factory("$redux", function (_, Immutable) {
      var Storage = Immutable.Map({});

      function getState() {
         return Storage.toJS();
      }

      function setAction(action, value) {
         Storage = Storage.set(action, value);
      }

      function checkStateAction(action) {
         return Storage.has(action);
      }

      function getAction(action) {
         return Storage.get(action);
      }

      function deleteAction(action) {
         Storage = Storage.delete(action);
      }


      return {
         getState: getState,
         setAction: setAction,
         checkStateAction: checkStateAction,
         getAction: getAction,
         deleteAction: deleteAction
      }
   });
}());
