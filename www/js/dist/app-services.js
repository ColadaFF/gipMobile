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

(function(){
    "use strict";
    angular.module("sigip").factory("$redux", function(_, Immutable){
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


        return {
            getState: getState,
            setAction: setAction,
            checkStateAction: checkStateAction,
            getAction: getAction
        }
    });
}());

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
         ionicToast.show(message, 'bottom', true, 200);
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
                           var mergeParticipantAndList= _.set(participant, 'type', listValue);
                           participantCollection.push(mergeParticipantAndList);
                           cbInner();
                        })
                        .catch(cbInner);
                  }, function (reason) {
                     cb(reason, participantCollection);
                  });
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
