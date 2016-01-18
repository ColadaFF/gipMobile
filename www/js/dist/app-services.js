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
   var ngModule = angular.module('sigip');
   ngModule.constant('moment', moment);
   ngModule.constant('_', _);
   ngModule.constant('Immutable', Immutable);
   ngModule.constant("API_URL", 'http://192.168.2.12:3000/api');
   ngModule.constant("API_HOST", 'http://192.168.2.12:3000');
   ngModule.constant("COUCHDB_URL", 'http://192.168.1.28:5984');
}());

(function () {
   "use strict";
   var ngModule = angular.module('sigip');
   ngModule.factory("locationServices", function($program_locations) {
      function getLocations() {
         return $program_locations.allDocs({
            include_docs: true
         });
      }

      function getLocationsBasicData() {
         function map(doc) {

            emit({
               _id: doc._id,
               sits: doc.sits,
               location: doc.location,
               program: doc.program,
               status: doc.status
            });
         }

         return $program_locations.query(map);
      }

      return {
         getLocations: getLocations,
         getLocationsBasicData: getLocationsBasicData
      };
   });
}());

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

(function(){
   "use strict";
   angular.module("sigip").service("participantServices", function($log, $q, $location_participants, async, $$messages, _, $contacts) {
      function getParticipants(locationID) {
         var deferred = $q.defer();
         deferred.notify("Get participants");
         if (!locationID) {
            deferred.resolve([]);
         } else {
            async.waterfall([
               function(cb) {

                  $location_participants
                     .find({
                        selector: {programLocation: locationID}
                     })
                     .then(data => {
                        cb(null, _.get(data, 'docs'))
                     })
                     .catch(cb);
               },
               function(participants, cb) {
                  let participantCollection = [];
                  async.each(participants, (participant, cbInner) => {
                     $contacts
                        .get(_.get(participant, 'contact'))
                        .then(contact => {
                           let mergeParticipantAndContact = _.set(participant, 'contact', contact);
                           participantCollection.push(mergeParticipantAndContact);
                           cbInner();
                        })
                        .catch(cbInner);
                  }, reason => {
                     cb(reason, participantCollection);
                  });
               }
            ], function(reason, participants) {
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

      return {
         getParticipants: getParticipants
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
      }).then(result => {
         console.log("Created index for participants", result);
      }).catch(err => {
         console.log("Error creating index for participants", err);
      });
      return participantDB;
   });
   ngModule.factory("$contacts", function (pouchDB, COUCHDB_URL) {
      return pouchDB('contacts');
   });
   ngModule.factory("$lists", function (pouchDB, async) {
      var listsDB = pouchDB('lists');
      listsDB.createIndex({
         index: {
            fields: ['name', 'key', 'value']
         }
      }).then(result => {
         console.log("Created index for lists", result);
      }).catch(err => {
         console.log("Error creating index for lists", err);
      });
      return listsDB;
   });
   ngModule.factory("$user", function (pouchDB) {
      return pouchDB('users');
   });
}());
