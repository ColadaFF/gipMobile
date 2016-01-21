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
