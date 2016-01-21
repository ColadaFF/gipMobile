(function () {
   "use strict";
   var ngModule = angular.module('sigip'),
      PouchDB = window.PouchDB;
   PouchDB.plugin(window.pouchdbFind);
   ngModule.constant('moment', moment);
   ngModule.constant('_', _);
   ngModule.constant('async', async);
   ngModule.constant('Immutable', Immutable);
   ngModule.constant("API_URL", 'http://192.168.2.12:3000/api');
   ngModule.constant("API_HOST", 'http://192.168.2.12:3000');
   ngModule.constant("COUCHDB_URL", 'http://52.23.181.232:5984');
}());
