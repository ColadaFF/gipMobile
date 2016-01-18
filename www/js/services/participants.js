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
