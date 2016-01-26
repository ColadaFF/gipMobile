(function () {
   "use strict";
   var ngModule = angular.module("sigip");
   ngModule.factory("$program_locations", function (pouchDB, COUCHDB_URL) {
      var locationDB = pouchDB('locations');
      return locationDB;
   });
   ngModule.factory("$location_participants", function (pouchDB, COUCHDB_URL) {
      var participantDB = pouchDB('participants');
      participantDB.createIndex({
         index: {
            fields: ['programLocation']
         }
      }).then(function (result) {
         console.log("Created index for participants", result);
      }).catch(function (err) {
         console.log("Error creating index for participants", err);
      });
      return participantDB;
   });
   ngModule.factory("$contacts", function (pouchDB, COUCHDB_URL) {
      return pouchDB('contacts');
   });
   ngModule.factory("$activitySchedule", function (pouchDB, COUCHDB_URL) {
      var activityScheduleDB = pouchDB('activitySchedule');
      activityScheduleDB.createIndex({
         index: {
            fields: ['activity', '_id']
         }
      }).then(function (result) {
         console.log("Created index for activitiesSchedules", result);
      }).catch(function (err) {
         console.log("Error creating index for activitiesSchedules", err);
      });
      return activityScheduleDB;
   });
   ngModule.factory("$sessions", function (pouchDB, COUCHDB_URL) {
      return pouchDB('sessions');
   });
   ngModule.factory("$lists", function (pouchDB) {
      var listsDB = pouchDB('lists');
      listsDB.createIndex({
         index: {
            fields: ['name']
         }
      }).then(function (result) {
         console.log("Created index for lists", result);
      }).catch(function (err) {
         console.log("Error creating index for lists", err);
      });
      return listsDB;
   });
   ngModule.factory("$user", function (pouchDB) {
      return pouchDB('users');
   });
}());
