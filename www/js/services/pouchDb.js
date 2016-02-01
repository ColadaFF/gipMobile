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
   ngModule.factory("$attendance", function (pouchDB, COUCHDB_URL) {
      var attendanceDB = pouchDB('attendance');
      attendanceDB.createIndex({
         index: {
            fields: ['session', '_id']
         }
      }).then(function (result) {
         console.log("Created index for session attendance", result);
      }).catch(function (err) {
         console.log("Error creating index for session attendance", err);
      });
      return attendanceDB;
   });
   ngModule.factory("$surveys", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('surveys');
      DB.createIndex({
         index: {
            fields: ['programId', '_id']
         }
      }).then(function (result) {
         console.log("Created index for surveys", result);
      }).catch(function (err) {
         console.log("Error creating index for surveys", err);
      });
      return DB;
   });
   ngModule.factory("$sections", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('survey_sections');
      DB.createIndex({
         index: {
            fields: ['surveyId', '_id']
         }
      }).then(function (result) {
         console.log("Created index for survey sections", result);
      }).catch(function (err) {
         console.log("Error creating index for survey sections", err);
      });
      return DB;
   });
   ngModule.factory("$questions", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('survey_questions');
      DB.createIndex({
         index: {
            fields: ['sectionId', '_id']
         }
      }).then(function (result) {
         console.log("Created index for survey question", result);
      }).catch(function (err) {
         console.log("Error creating index for survey questions", err);
      });
      return DB;
   });
   ngModule.factory("$answers", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('survey_answers');
      DB.createIndex({
         index: {
            fields: ['question', '_id']
         }
      }).then(function (result) {
         console.log("Created index for survey answers", result);
      }).catch(function (err) {
         console.log("Error creating index for survey answers", err);
      });
      return DB;
   });
   ngModule.factory("$anonInstances", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('survey_anonymous');
      DB.createIndex({
         index: {
            fields: ['survey', '_id', 'programLocation']
         }
      }).then(function (result) {
         console.log("Created index for survey anonymous instances", result);
      }).catch(function (err) {
         console.log("Error creating index for survey anonymous instances", err);
      });
      return DB;
   });
   ngModule.factory("$participantInstances", function (pouchDB, COUCHDB_URL) {
      var DB = pouchDB('survey_participants');
      DB.createIndex({
         index: {
            fields: ['survey', '_id', 'programLocation', 'beneficiary']
         }
      }).then(function (result) {
         console.log("Created index for survey participant instances", result);
      }).catch(function (err) {
         console.log("Error creating index for survey participant instances", err);
      });
      return DB;
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
