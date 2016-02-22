(function () {
   "use strict";
   var ngModule = angular.module('sigip'),
      PouchDB = window.PouchDB;
   ngModule.constant('moment', moment);
   ngModule.constant('_', _);
   ngModule.constant('async', async);
   ngModule.constant('Immutable', Immutable);
   ngModule.constant('$ObjectId', ObjectID);
   ngModule.constant("API_URL", 'http://52.3.24.46:80/api');
   ngModule.constant("API_HOST", 'http://52.3.24.46:80');
   ngModule.constant("COUCHDB_URL", 'http://52.23.181.232');
}());
