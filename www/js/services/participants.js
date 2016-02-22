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
                        selector: {
                           programLocation: locationID
                        }
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
                        .catch(function (err) {
                           if(err.status === 404){
                              cbInner();
                           }else{

                              cbInner(err);
                           }
                        });
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
