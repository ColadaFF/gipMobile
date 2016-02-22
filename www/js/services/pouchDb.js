(function () {
   "use strict";
   var indexes = addIndex();
   PouchDB.debug.enable('pouchdb:find');
   var ngModule = angular.module("sigip");

   ngModule.factory("$program_locations", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var locationDB = new pouchDB('locations');
      locationDB.find = pouchDBDecorators.qify(locationDB.find);
      locationDB.upsert = pouchDBDecorators.qify(locationDB.upsert);
      locationDB.createIndex = pouchDBDecorators.qify(locationDB.createIndex);
      return locationDB;
   });
   ngModule.factory("$location_participants", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var participantDB = new pouchDB('participants');
      participantDB.find = pouchDBDecorators.qify(participantDB.find);
      participantDB.createIndex = pouchDBDecorators.qify(participantDB.createIndex);
      return participantDB;
   });
   ngModule.factory("$contacts", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var db = new pouchDB('contacts');
      db.find = pouchDBDecorators.qify(db.find);
      return db;
   });
   ngModule.factory("$alerts", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var db = new pouchDB('alerts');
      db.find = pouchDBDecorators.qify(db.find);
      return db;
   });
   ngModule.factory("$activitySchedule", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var activityScheduleDB = new pouchDB('activitySchedule');
      activityScheduleDB.find = pouchDBDecorators.qify(activityScheduleDB.find);
      activityScheduleDB.createIndex = pouchDBDecorators.qify(activityScheduleDB.createIndex);
      return activityScheduleDB;
   });
   ngModule.factory("$sessions", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var sessionsDB = new pouchDB('sessions');
      sessionsDB.find = pouchDBDecorators.qify(sessionsDB.find);
      sessionsDB.createIndex = pouchDBDecorators.qify(sessionsDB.createIndex);
      return sessionsDB;
   });
   ngModule.factory("$attendance", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var attendanceDB = new pouchDB('attendance');
      attendanceDB.find = pouchDBDecorators.qify(attendanceDB.find);
      attendanceDB.createIndex = pouchDBDecorators.qify(attendanceDB.createIndex);
      return attendanceDB;
   });
   ngModule.factory("$surveys", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('surveys');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      return DB;
   });
   ngModule.factory("$sections", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('survey_sections');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$questions", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('survey_questions');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$answers", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('survey_answers');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$anonInstances", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('survey_anonymous');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$methodologicalTracing", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('methodological_tracing');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$participantInstances", function (pouchDB, COUCHDB_URL, pouchDBDecorators) {
      var DB = new pouchDB('survey_participants');
      DB.find = pouchDBDecorators.qify(DB.find);
      DB.upsert = pouchDBDecorators.qify(DB.upsert);
      DB.createIndex = pouchDBDecorators.qify(DB.createIndex);
      return DB;
   });
   ngModule.factory("$lists", function (pouchDB, pouchDBDecorators) {
      var listsDB = new pouchDB('lists');
      listsDB.find = pouchDBDecorators.qify(listsDB.find);
      listsDB.upsert = pouchDBDecorators.qify(listsDB.upsert);
      listsDB.createIndex = pouchDBDecorators.qify(listsDB.createIndex);
      return listsDB;
   });
   ngModule.factory("$user", function (pouchDB) {
      return pouchDB('users');
   });


   ngModule.factory("$config", function ($program_locations,
                                         $location_participants,
                                         $contacts,
                                         $activitySchedule,
                                         $sessions,
                                         $attendance,
                                         $surveys,
                                         $sections,
                                         $questions,
                                         $answers,
                                         $anonInstances,
                                         $participantInstances,
                                         $lists,
                                         $q,
                                         async,
                                         $alerts) {
      function indexAll() {
         var deferred = $q.defer();
         async.series([
            function (cb) {
               $program_locations.createIndex({
                  index: {
                     fields: ['_id', 'program']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $location_participants.createIndex({
                  index: {
                     fields: ['programLocation']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $activitySchedule.createIndex({
                  index: {
                     fields: ['activity', '_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $sessions.createIndex({
                  index: {
                     fields: ['_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $attendance.createIndex({
                  index: {
                     fields: ['session', '_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               async.series([
                  function (cbInner) {
                     $surveys.createIndex({
                        index: {
                           fields: ['programId', '_id']
                        }
                     }).then(function (result) {
                        cbInner(null, result);
                     }).catch(cbInner);
                  },
                  function (cbInner) {
                     $surveys.createIndex({
                        index: {
                           fields: ['programId', 'deleted']
                        }
                     }).then(function (result) {
                        cbInner(null, result);
                     }).catch(cbInner);
                  }
               ], cb);
            },
            function (cb) {
               $sections.createIndex({
                  index: {
                     fields: ['surveyId', '_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $answers.createIndex({
                  index: {
                     fields: ['question', '_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $questions.createIndex({
                  index: {
                     fields: ['_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $anonInstances.createIndex({
                  index: {
                     fields: ['survey', 'programLocation']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $alerts.createIndex({
                  index: {
                     fields: ['programLocation']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $participantInstances.createIndex({
                  index: {
                     fields: ['survey', '_id', 'programLocation', 'beneficiary']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            },
            function (cb) {
               $lists.createIndex({
                  index: {
                     fields: ['name'],
                     type: 'json'
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
            }
         ], function (err, result) {
            if (err) {
               deferred.reject(err);
            } else {
               deferred.resolve(result);
            }
         });
         return deferred.promise;
      }

      return {
         indexAll: indexAll
      }
   });

   function addIndex() {
      var fields = [
         {
            entity: "list",
            fields: ["_id", "name"]
         },
         {
            entity: "participant",
            fields: ["_id", "id", 'programLocation']
         },
         {
            entity: "programLocations",
            fields: ["_id", 'program']
         },
         {
            entity: "activitySchedule",
            fields: ["activity", '_id']
         },
         {
            entity: "sessions",
            fields: ["_id"]
         },
         {
            entity: "attendance",
            fields: ["_id", 'session']
         },
         {
            entity: "surveys",
            fields: ["_id", 'programId']
         },
         {
            entity: "surveySections",
            fields: ["_id", 'surveyId']
         },
         {
            entity: 'survey_questions',
            fields: ['sectionId', '_id']
         },
         {
            entity: 'survey_answers',
            fields: ['question', '_id']
         },
         {
            entity: 'survey_anonymous',
            fields: ['survey', '_id', 'programLocation']
         },
         {
            entity: 'survey_participants',
            fields: ['survey', '_id', 'programLocation', 'beneficiary']
         }
      ];

      return {
         location: fieldTemplate(fields[2]),
         participants: fieldTemplate(fields[1]),
         lists: fieldTemplate(fields[0]),
         activitySchedule: fieldTemplate([3]),
         sessions: fieldTemplate([4]),
         attendance: fieldTemplate([5]),
         surveys: fieldTemplate([6]),
         surveySections: fieldTemplate([7]),
         survey_questions: fieldTemplate([8]),
         survey_answers: fieldTemplate([9]),
         survey_anonymous: fieldTemplate([10]),
         survey_participants: fieldTemplate([11])

      }

   }

   function fieldTemplate(objectData) {
      var fields = _.get(objectData, 'fields');
      var field = {};
      _.forEach(fields, function (f) {
         field[f] = "asc";
      });
      var newField = JSON.stringify(field);
      var template = _.template('{"_id": "_design/index<%=entity%>","language": "query","views": {"idx-index<%=entity%>": {"map": {"fields": <%=field%>}},"reduce": "_count","options": {"def": {"fields": <%=fields%>}}}}');
      var compiled = template({
         entity: _.get(objectData, 'entity'),
         field: newField,
         fields: JSON.stringify(fields)
      });
      return compiled;
   }
}());
