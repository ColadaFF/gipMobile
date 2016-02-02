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
                         $participantInstances) {
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
                  }
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
   ];
   angular.module('sigip').factory("syncServices", syncServices);
}());
