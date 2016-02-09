(function () {
   "use strict";
   function activitySchedules($activitySchedule, COUCHDB_URL, $log) {

      function findByActivity(idReference) {
         return $activitySchedule
            .find({
               selector: {
                  _id: idReference
               }
            })
      }

      function syncActivities(){
         return $activitySchedule.sync(COUCHDB_URL + "/sigip_activity_schedule", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });
      }

      return {
         findByActivity: findByActivity,
         syncActivities: syncActivities
      }

   }

   activitySchedules.$inject = ["$activitySchedule", "COUCHDB_URL", "$log"];

   var ngModule = angular.module('sigip');
   ngModule.factory('activitySchedules', activitySchedules);
}());

(function () {
   "use strict";
   function sessionServices($sessions, COUCHDB_URL, $log) {
      function getSession(sessionId) {
         return $sessions.get(sessionId);
      }

      function syncSessions(){
         return $sessions.sync(COUCHDB_URL + "/sigip_sessions", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });
      }

      return {
         syncSessions: syncSessions,
         getSession: getSession
      }
   }

   sessionServices.$inject = ['$sessions', "COUCHDB_URL", '$log'];
   angular.module('sigip').factory('sessionServices', sessionServices)
}());

angular.module('sigip').factory('loginFactory', function ($resource, API_URL, $window) {
   return {
      login: function (data) {
         return $resource(
            API_URL + '/users/auth',
            {},
            {
               authenticate: {
                  method: 'POST',
                  headers: {
                     Authorization: 'Bearer ' + $window.btoa(JSON.stringify(data))
                  }
               }
            }
         );
      },
      "getUserInfo": function (token) {
         return $resource(
            API_URL + "/users/jwt",
            {},
            {
               "info": {
                  "method": "GET",
                  "headers": {
                     Authorization: 'Bearer ' + token
                  }
               }
            }
         );
      }
   };
});

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
         Storage.delete(action);
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

(function () {
   "use strict";
   function attendanceServices($attendance, COUCHDB_URL, $log) {
      function getAttendanceBySession(sessionId) {
         return $attendance.find({
            selector: {
               session: sessionId
            },
            limit: 1
         });
      }

      function syncAttendances() {
         return $attendance.sync(COUCHDB_URL + "/sigip_attendances", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });
      }

      return {
         syncAttendances: syncAttendances,
         getAttendanceBySession: getAttendanceBySession
      }
   }

   attendanceServices.$inject = ['$attendance', "COUCHDB_URL", '$log'];
   angular.module('sigip').factory('attendanceServices', attendanceServices)
}());

var ngModule = angular.module('sigip');
ngModule.factory("AuthTokenFactory", function ($window) {
   const store = $window.localStorage;
   const TOKEN_KEY = "AUTH_KEY";

   function setToken(token) {
      if (token) {
         store.setItem(TOKEN_KEY, token);
      } else {
         store.removeItem(TOKEN_KEY);
      }
   }

   function getToken() {
      return store.getItem(TOKEN_KEY);
   }

   return {
      getToken: getToken,
      setToken: setToken
   };
});

ngModule.factory("AuthInterceptor", function (AuthTokenFactory) {
   function addAuthToken(config) {
      var token = AuthTokenFactory.getToken();
      if (token) {
         config.headers = config.headers || {};
         config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
   }

   return {
      request: addAuthToken
   };
});

(function () {
   "use strict";
   var ngModule = angular.module('sigip'),
      PouchDB = window.PouchDB;
   ngModule.constant('moment', moment);
   ngModule.constant('_', _);
   ngModule.constant('async', async);
   ngModule.constant('Immutable', Immutable);
   ngModule.constant('$ObjectId', ObjectID);
   ngModule.constant("API_URL", 'http://52.3.24.46:3000/api');
   ngModule.constant("API_HOST", 'http://52.3.24.46:3000');
   ngModule.constant("COUCHDB_URL", 'http://52.23.181.232');
}());

(function () {
   "use strict";
   var ngModule = angular.module('sigip');

   function sanitizeFactory(_, moment) {
      function cleanModel(model) {

         function isEmpty(value) {
            return _.isString(value) && ( _.isEqual(value, '') || _.isEqual(value, 'null'));
         }

         var newModel = {};
         _.forOwn(model, function (value, key) {
            if (!_.isNull(value) && !_.isUndefined(value) && !isEmpty(value)) {
               if (!_.isObject(value) && !_.isArray(value) && !moment.isDate(value)) {
                  newModel = _.set(newModel, key, String(value));
               } else {
                  newModel = _.set(newModel, key, value);
               }
            }
         });
         return newModel;
      }

      return {
         cleanModel: cleanModel
      };
   }

   sanitizeFactory.$inject = ["_", 'moment'];
   ngModule.factory("Sanitize$", sanitizeFactory);
}());


(function () {
   "use strict";
   var ngModule = angular.module('sigip');
   ngModule.factory("locationServices", function ($program_locations, COUCHDB_URL, $log, async, $q, listServices, _) {


      function getLocations() {
         return $program_locations.allDocs({
            include_docs: true
         });
      }

      function getLocationsBasicData() {
         var deferred = $q.defer(),
            locationCollection = [];

         function map(doc) {

            emit(doc._id, {
               _id: doc._id,
               sits: doc.sits,
               location: doc.location,
               program: doc.program,
               status: doc.status
            });
         }

         $program_locations.query(map)
            .then(function (data) {
               console.log(data);
               async.each(data.rows, function (location, cb) {
                  listServices.getListValueById(_.get(location, 'value.location'))
                     .then(function (listValue) {
                        var mergedDoc = _.set(_.get(location, 'value'), 'location', listValue);
                        locationCollection.push(mergedDoc);
                        cb();
                     })
                     .catch(cb)
               }, function (err) {
                  if (err) {
                     deferred.reject(err);
                  } else {
                     deferred.resolve(locationCollection);
                  }
               });
            })
            .catch(function (reason) {
               deferred.reject(reason);
            });
         return deferred.promise;
      }

      function syncAllLocations() {
         $program_locations.sync(COUCHDB_URL + "/sigip_locations", {
            live: true,
            retry: true
         });
      }

      return {
         getLocations: getLocations,
         getLocationsBasicData: getLocationsBasicData,
         syncAllLocations: syncAllLocations
      };
   });
}());

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

(function () {
   "use strict";
   angular.module("sigip").service("participantServices", function ($log,
                                                                    $q,
                                                                    $location_participants,
                                                                    async,
                                                                    $$messages,
                                                                    _,
                                                                    $contacts,
                                                                    COUCHDB_URL,
                                                                    $lists) {

      function formatName(name) {
         return _.chain(name)
            .split(' ')
            .map(_.capitalize)
            .join(' ')
            .value();
      }

      function getParticipants(locationID) {
         var deferred = $q.defer();
         deferred.notify("Get participants");
         if (!locationID) {
            deferred.resolve(false);
         } else {
            async.waterfall([
               function (cb) {

                  $location_participants
                     .find({
                        selector: {programLocation: locationID}
                     })
                     .then(function (data) {
                        cb(null, _.get(data, 'docs'))
                     })
                     .catch(cb);
               },
               function (participants, cb) {
                  var participantCollection = [];
                  async.each(participants, function (participant, cbInner) {
                     $contacts
                        .get(_.get(participant, 'id'))
                        .then(function (contact) {
                           var mergeParticipantAndContact = _.set(participant, 'id', contact);
                           participantCollection.push(mergeParticipantAndContact);
                           cbInner();
                        })
                        .catch(cbInner);
                  }, function (reason) {
                     cb(reason, participantCollection);
                  });
               },
               function (participants, cb) {
                  var participantCollection = [];
                  async.each(participants, function (participant, cbInner) {
                     $lists
                        .get(_.get(participant, 'type'))
                        .then(function (listValue) {
                           var mergeParticipantAndList = _.set(participant, 'type', listValue);
                           participantCollection.push(mergeParticipantAndList);
                           cbInner();
                        })
                        .catch(cbInner);
                  }, function (reason) {
                     cb(reason, participantCollection);
                  });
               },
               function (participants, cb) {
                  var participantCollection = [];
                  async.each(participants, function (participant, cbInner) {
                     var relatives = _.get(participant, 'id.relatives', []);
                     var relativesPopulated = [];
                     async.each(relatives, function (relative, cbRelative) {
                        $contacts.get(relative.id)
                           .then(function (data) {
                              relativesPopulated.push(_.set(relative, 'id', data));
                              cbRelative();
                           })
                           .catch(function (err) {
                              cbRelative(err);
                           });
                     }, function (err) {
                        if (err) {
                           cbInner(err);
                        } else {
                           var merge = _.set(participant, 'id.relatives', relativesPopulated);
                           participantCollection.push(merge);
                           cbInner();
                        }
                     });
                  }, function (reason) {
                     cb(reason, participantCollection);
                  });
               },
               function (participants, cb) {
                  var sorted = _.chain(participants)
                     .map(function (participant) {
                        var dataName = _.set(participant, 'id.name', formatName(participant.id.name));
                        return _.set(dataName, 'id.lastname', formatName(participant.id.lastname));
                     })
                     .sortBy(function (participant) {
                        return _.get(participant, 'id.lastname');
                     })
                     .value();
                  cb(null, sorted);
               }
            ], function (reason, participants) {
               if (reason) {
                  $$messages.simpleMessage("Error obteniendo participantes");
                  $log.error(reason);
                  deferred.reject(reason);
               } else {
                  deferred.resolve(participants);
               }
            });
         }
         return deferred.promise;
      }


      function syncAllParticipants() {
         return $location_participants.sync(COUCHDB_URL + "/sigip_participants", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });

      }

      function syncAllContacts() {
         return $contacts.sync(COUCHDB_URL + "/sigip_contacts", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });

      }

      return {
         getParticipants: getParticipants,
         syncAllParticipants: syncAllParticipants,
         syncAllContacts: syncAllContacts
      };
   });

}());

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
               $surveys.createIndex({
                  index: {
                     fields: ['programId', '_id']
                  }
               }).then(function (result) {
                  cb(null, result);
               }).catch(cb);
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

(function () {
      "use strict";
      var ngModule = angular.module('sigip');
      ngModule.factory("listServices", function ($lists, COUCHDB_URL, $log) {

         function getLocations() {
            return $lists.allDocs({
               include_docs: true
            });
         }

         function getListValues(name) {
            return $lists.find({
               selector: {name: name}
            });
         }

         function getListValueById(_id) {
            return $lists.get(_id);
         }

         function syncAllLocations() {
            return $lists.sync(COUCHDB_URL + "/sigip_lists", {
               live: true,
               retry: true
            }).on('change', function (info) {
                  $log.info(info);
               })
               .on('complete', function (info) {
                  $log.info(info);
               }).on('error', function (err) {
                  $log.error(err);
               });

         }

         return {
            getLists: getLocations,
            getListValues: getListValues,
            syncAllLocations: syncAllLocations,
            getListValueById: getListValueById
         };
      });
   }());

(function () {
   "use strict";
   function syncServices($q,
                         $program_locations,
                         $location_participants,
                         $contacts,
                         $activitySchedule,
                         $sessions,
                         $attendance,
                         $lists,
                         async,
                         COUCHDB_URL,
                         $log,
                         _,
                         $user,
                         jwtHelper,
                         $redux,
                         $surveys,
                         $sections,
                         $questions,
                         $answers,
                         $anonInstances,
                         $participantInstances,
                         $alerts) {
      function syncAll() {
         var user = $redux.getAction('loggedUser');
         var deferred = $q.defer();
         async.waterfall([
            function (cb) {
               $user
                  .allDocs({
                     include_docs: true,
                     attachments: true
                  }, function (err, docs) {
                     if (err) {
                        cb(err);
                     } else {
                        cb(null, _.get(docs, 'rows.0.doc'));
                     }
                  });
            },
            function (user, cb) {
               $program_locations
                  .sync(COUCHDB_URL + "/sigip_locations", {
                     retry: true,
                     filter: 'location/by_member',
                     query_params: {"id": _.get(user, 'info.contact._id')}
                  })
                  .on('change', function (info) {
                     $log.info(info);
                  })
                  .on('complete', function (info) {
                     cb();
                  })
                  .on('error', cb);
            },
            function (cb) {
               async.series([
                  function (cbParticipants) {
                     $program_locations
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var locations = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.get(innerItem, 'doc._id');
                              });
                              async.each(locations, function (location, cbInner) {
                                 $location_participants
                                    .sync(COUCHDB_URL + "/sigip_participants", {
                                       retry: true,
                                       filter: 'participants/byLocation',
                                       query_params: {"location": location}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbParticipants)
                           }
                        });
                  },
                  function (cbParticipants) {
                     $location_participants
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var participants = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.get(innerItem, 'doc.id');
                              });
                              async.each(participants, function (participant, cbInner) {
                                 $contacts
                                    .sync(COUCHDB_URL + "/sigip_contacts", {
                                       retry: true,
                                       filter: 'contacts/byId',
                                       query_params: {"id": participant}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbParticipants)
                           }
                        });
                  },
                  function (cbParticipants) {
                     $contacts
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var relatives = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.map(_.get(innerItem, 'doc.relatives'), function (relative) {
                                    return _.get(relative, 'id');
                                 })
                              });
                              async.each(_.flatten(relatives), function (relative, cbInner) {
                                 $contacts
                                    .sync(COUCHDB_URL + "/sigip_contacts", {
                                       retry: true,
                                       filter: 'contacts/byId',
                                       query_params: {"id": relative}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbParticipants)
                           }
                        });
                  }
               ], cb);
            },
            function (results, cb) {
               async.series([
                  function (cbActivity) {
                     $program_locations
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var activities = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.flatten(_.map(_.get(innerItem, 'doc.activities'), function (activity) {
                                    return _.map(_.get(activity, 'schedules'), 'reference');
                                 }));
                              });
                              async.each(_.flatten(activities), function (reference, cbInner) {
                                 $activitySchedule
                                    .sync(COUCHDB_URL + "/sigip_activity_schedule", {
                                       retry: true,
                                       filter: 'activities/byActivityReference',
                                       query_params: {"reference": reference}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbActivity)
                           }
                        });
                  },
                  function (cbActivity) {
                     $activitySchedule
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var activities = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.map(_.get(innerItem, 'doc.months'), function (month) {
                                    return _.get(month, 'sessions');
                                 })
                              });
                              async.each(_.flattenDeep(activities), function (reference, cbInner) {
                                 $sessions
                                    .sync(COUCHDB_URL + "/sigip_sessions", {
                                       retry: true,
                                       filter: 'sessions/bySchedule',
                                       query_params: {"reference": reference}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbActivity)
                           }
                        });
                  },
                  function (cbActivity) {
                     $sessions
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var sessions = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.get(innerItem, 'doc._id');
                              });
                              console.log(sessions, _.flattenDeep(sessions), 'sessions');
                              async.each(_.flattenDeep(sessions), function (session, cbInner) {
                                 $attendance
                                    .sync(COUCHDB_URL + "/sigip_attendances", {
                                       retry: true,
                                       filter: 'attendance/bySession',
                                       query_params: {"session": session}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbActivity)
                           }
                        });
                  }
               ], cb);
            },
            function (response, cb) {
               async.series([
                  function (cbSurveys) {
                     $program_locations
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var locations = _.map(_.get(docs, 'rows'), function (innerItem) {
                                    return _.get(innerItem, 'doc.program');
                                 }),
                                 locationIds = _.map(_.get(docs, 'rows'), function (innerItem) {
                                    return _.get(innerItem, 'doc._id');
                                 });
                              async.series([
                                 function (cbLocationsSurveys) {
                                    async.each(locations, function (program, cbInner) {
                                       $surveys
                                          .sync(COUCHDB_URL + "/sigip_surveys", {
                                             retry: true,
                                             filter: 'surveys/byProgram',
                                             query_params: {"program": program}
                                          })
                                          .on('change', function (info) {
                                             $log.info(info);
                                          })
                                          .on('complete', function (info) {
                                             cbInner();
                                          })
                                          .on('error', cbInner);
                                    }, cbLocationsSurveys)
                                 },
                                 function (cbLocationsSurveys) {
                                    async.each(locationIds, function (location, cbInner) {
                                       $anonInstances
                                          .sync(COUCHDB_URL + "/sigip_anonymous_instances", {
                                             retry: true,
                                             filter: 'anonymous/byLocation',
                                             query_params: {"location": location}
                                          })
                                          .on('change', function (info) {
                                             $log.info(info);
                                          })
                                          .on('complete', function (info) {
                                             cbInner();
                                          })
                                          .on('error', cbInner);
                                    }, cbLocationsSurveys)
                                 },
                                 function (cbLocationAlerts) {
                                    async.each(locationIds, function (location, cbInner) {
                                       $alerts
                                          .sync(COUCHDB_URL + "/sigip_alerts", {
                                             retry: true,
                                             filter: 'alerts/byLocation',
                                             query_params: {"location": location}
                                          })
                                          .on('change', function (info) {
                                             $log.info(info);
                                          })
                                          .on('complete', function (info) {
                                             cbInner();
                                          })
                                          .on('error', cbInner);
                                    }, cbLocationAlerts)
                                 },
                                 function (cbLocationsSurveys) {
                                    async.each(locationIds, function (location, cbInner) {
                                       $participantInstances
                                          .sync(COUCHDB_URL + "/sigip_participants_instances", {
                                             retry: true,
                                             filter: 'participants/byLocation',
                                             query_params: {"location": location}
                                          })
                                          .on('change', function (info) {
                                             $log.info(info);
                                          })
                                          .on('complete', function (info) {
                                             cbInner();
                                          })
                                          .on('error', cbInner);
                                    }, cbLocationsSurveys)
                                 }
                              ], cbSurveys);
                           }
                        });
                  },
                  function (cbSurveys) {
                     $surveys
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var surveys = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.get(innerItem, 'doc._id');
                              });
                              async.each(surveys, function (survey, cbInner) {
                                 $sections
                                    .sync(COUCHDB_URL + "/sigip_sections", {
                                       retry: true,
                                       filter: 'sections/bySurvey',
                                       query_params: {"survey": survey}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbSurveys)
                           }
                        });
                  },
                  function (cbSurveys) {
                     $sections
                        .allDocs({
                           include_docs: true,
                           attachments: true
                        }, function (err, docs) {
                           if (err) {
                              cb(err);
                           } else {
                              var questions = _.map(_.get(docs, 'rows'), function (innerItem) {
                                 return _.get(innerItem, 'doc.questions');
                              });
                              async.each(_.flatten(questions), function (question, cbInner) {
                                 $questions
                                    .sync(COUCHDB_URL + "/sigip_questions", {
                                       retry: true,
                                       filter: 'questions/bySection',
                                       query_params: {"question": question}
                                    })
                                    .on('change', function (info) {
                                       $log.info(info);
                                    })
                                    .on('complete', function (info) {
                                       cbInner();
                                    })
                                    .on('error', cbInner);
                              }, cbSurveys)
                           }
                        });
                  }/*,
                  function (cbAnswers) {
                     async.waterfall([
                        function (cbInnerAnswers) {
                           $anonInstances
                              .allDocs({
                                 include_docs: true,
                                 attachments: true
                              }, function (err, instances) {
                                 if (err) {
                                    cbAnswers(err);
                                 } else {
                                    var answers = _
                                       .chain(instances.rows)
                                       .map(function (item) {
                                          return _.get(item, 'doc.solution');
                                       })
                                       .flatten()
                                       .map(function (item) {
                                          return _.get(item, 'answers');
                                       })
                                       .flatten()
                                       .filter(function (item) {
                                          return !_.isUndefined(item);
                                       })
                                       .value();
                                    cbInnerAnswers(null, answers)
                                 }
                              });
                        },
                        function (answers, cbInnerAnswers) {
                           $answers
                              .sync(COUCHDB_URL + "/sigip_answers", {
                                 retry: true,
                              })
                              .on('change', function (info) {
                                 $log.info(info);
                              })
                              .on('complete', function (info) {
                                 cbInnerAnswers();
                              })
                              .on('error', cbInnerAnswers);
                        }
                     ], cbAnswers);
                  }*/
               ], cb);
            },
            function (results, cb) {
               $lists
                  .sync(COUCHDB_URL + "/sigip_lists", {
                     retry: true
                  })
                  .on('change', function (info) {
                     $log.info(info);
                  })
                  .on('complete', function (info) {
                     cb(null, info);
                  })
                  .on('error', cb);
            }
            /*function (cb) {
             $location_participants
             .sync(COUCHDB_URL + "/sigip_participants", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             },
             function (cb) {
             $contacts
             .sync(COUCHDB_URL + "/sigip_contacts", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             },
             function (cb) {
             $activitySchedule
             .sync(COUCHDB_URL + "/sigip_activity_schedule", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             },
             function (cb) {
             $sessions
             .sync(COUCHDB_URL + "/sigip_sessions", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             },
             function (cb) {
             $lists
             .sync(COUCHDB_URL + "/sigip_lists", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             },
             function (cb) {
             $attendance
             .sync(COUCHDB_URL + "/sigip_attendances", {
             retry: true
             })
             .on('change', function (info) {
             $log.info(info);
             })
             .on('complete', function (info) {
             cb(null, info);
             })
             .on('error', cb);
             }*/
         ], function (err, responses) {
            if (err) {
               deferred.reject(err);
            } else {
               deferred.resolve(responses);
            }
         });

         return deferred.promise;
      }

      function saveUserDB(token, userInfo) {
         var decoded = jwtHelper.decodeToken(token),
            info = jwtHelper.decodeToken(userInfo);
         $user.get(_.get(decoded, '_id'))
            .then(function (doc) {
               $log.info("data", doc);
            }, function (reason) {
               if (reason.name === "not_found") {
                  $user
                     .allDocs()
                     .then(function (docs) {
                        console.log(docs);
                        async.each(docs.rows, function (item, cbInner) {
                           $user
                              .remove(item.doc._id, item.doc.value.rev)
                              .then(function (res) {
                                 $log.info(res);
                                 cbInner();
                              })
                              .catch(cbInner);
                        }, function (err) {
                           if (err) {
                              $log.error(err);
                           } else {
                              $user.post(_.set(_.omit(decoded, '__v'), 'info', info))
                                 .then($log.info, $log.error);
                           }
                        });
                     })
                     .catch(function (reason) {
                        $log.error(reason);
                     });
               } else {
                  $log.error(reason);
               }
            });
      }

      function loadUserFromDb() {
         return $user.allDocs({
            include_docs: true,
            attachments: true
         });
      }

      function cleanDbs() {
         var deferred = $q.defer();
         async.parallel([
            function (cb) {
               $program_locations.destroy(cb);
            },
            function (cb) {
               $location_participants.destroy(cb);
            },
            function (cb) {
               $contacts.destroy(cb);
            },
            function (cb) {
               $activitySchedule.destroy(cb);
            },
            function (cb) {
               $sessions.destroy(cb);
            },
            function (cb) {
               $attendance.destroy(cb);
            },
            function (cb) {
               $lists.destroy(cb);
            },
            function (cb) {
               $user.destroy(cb);
            },
            function (cb) {
               $surveys.destroy(cb);
            },
            function (cb) {
               $questions.destroy(cb);
            },
            function (cb) {
               $sections.destroy(cb);
            },
            function (cb) {
               $anonInstances.destroy(cb);
            },
            function (cb) {
               $participantInstances.destroy(cb);
            },
            function (cb) {
               $answers.destroy(cb);
            }
         ], function (err, response) {
            if (err) {
               deferred.reject(err);
            } else {
               deferred.resolve(response);
            }
         });
         return deferred.promise;
      }

      function deleteUserFormDb() {
         var user = $redux.getAction('loggedUser');
         console.log(user);
         return $user.remove(user._id, user._rev);
      }

      return {
         syncAll: syncAll,
         saveUserDB: saveUserDB,
         loadUserFromDb: loadUserFromDb,
         deleteUserFormDb: deleteUserFormDb,
         cleanDbs: cleanDbs
      }
   }

   syncServices.$inject = [
      '$q',
      '$program_locations',
      '$location_participants',
      '$contacts',
      '$activitySchedule',
      '$sessions',
      '$attendance',
      '$lists',
      'async',
      'COUCHDB_URL',
      '$log',
      '_',
      '$user',
      'jwtHelper',
      '$redux',
      '$surveys',
      '$sections',
      '$questions',
      '$answers',
      '$anonInstances',
      '$participantInstances',
      '$alerts'
   ];
   angular.module('sigip').factory("syncServices", syncServices);
}());
