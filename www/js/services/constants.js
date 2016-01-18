(function () {
   "use strict";
   var ngModule = angular.module('sigip');
   ngModule.constant('moment', moment);
   ngModule.constant('_', _);
   ngModule.constant('Immutable', Immutable);
   ngModule.constant("API_URL", 'http://192.168.2.12:3000/api');
   ngModule.constant("API_HOST", 'http://192.168.2.12:3000');
   ngModule.constant("COUCHDB_URL", 'http://192.168.1.28:5984');
}());
