angular.module('sigip', ['ionic', 'sigip.controllers', 'formly', 'sigipFormly', 'pouchdb', 'ionic-toast', 'ngResource', 'angular-jwt'])

   .run(function ($ionicPlatform, formlyConfig, $rootScope, $config, $log) {
      $ionicPlatform.ready(function () {
         // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
         // for form inputs)
         if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

         }
         if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
         }
         $ionicPlatform.isFullScreen = true;
      });

      $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, error) {
         console.log(arguments);
      });


      $config.indexAll().then($log.info, $log.error);
   })

   .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider

         .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
         })

         .state('app.landing', {
            url: '/landing',
            views: {
               'menuContent': {
                  templateUrl: 'templates/landing.html'
               }
            }
         })

         .state('app.locations', {
            url: '/locations',
            views: {
               'menuContent': {
                  templateUrl: 'templates/locations/list.html',
                  controller: 'locationsCtlr',
                  controllerAs: 'vm',
                  resolve: {
                     locations: ["locationServices", function (locationServices) {
                        return locationServices.getLocationsBasicData();
                     }]
                  }
               }
            }
         })

         .state('app.participants', {
            url: '/participants',
            views: {
               'menuContent': {
                  templateUrl: 'templates/participants/list.html',
                  controller: 'participantsCtlr',
                  controllerAs: 'vm',
                  resolve: {
                     participants: ["participantServices", "$redux", '_', function (participantServices, $redux, _) {
                        var location = $redux.getAction('selectedLocation');
                        return participantServices.getParticipants(_.get(location, '_id'));
                     }]
                  }
               }
            }
         })

         .state('app.participant', {
            url: '/participant',
            views: {
               'menuContent': {
                  templateUrl: 'templates/participants/participant_details.html',
                  controller: 'participantDetails',
                  controllerAs: 'vm',
                  resolve: {
                     participant: ["$redux", "async", "$q", "$contacts", function ($redux, async, $q, $contacts) {
                        var deferred = $q.defer();
                        /*var selectedParticipant =*/
                        return $redux.getAction('selectedParticipant');
                        /*var relativesFromParticipant = _.get(selectedParticipant, 'id.relatives');
                         var relativesPopulated = [];
                         async.each(relativesFromParticipant, function (relative, cbInner) {
                         $contacts.get(relative.id)
                         .then(function (data) {
                         relativesPopulated.push(_.set(relative, 'id', data));
                         cbInner();
                         })
                         .catch(function (err) {
                         cbInner(err);
                         });
                         }, function (err) {
                         if (err) {
                         deferred.reject(err);
                         } else {
                         var merge = _.set(selectedParticipant, 'id.relatives', relativesPopulated);
                         console.log("merge", merge);
                         deferred.resolve(merge);
                         }
                         });
                         return deferred.promise;*/
                     }],
                     lists: ["listServices", "$q", "async", "_", function (listServices, $q, async, _) {
                        var deferred = $q.defer();
                        var lists = [
                           'typeParticipant',
                           'idType',
                           'rH',
                           'maritalStatus',
                           'actualActivity',
                           'ethnic',
                           'healthServiceEntity',
                           'healthRegime'
                        ];
                        var collection = [];
                        async.each(lists, function (listName, cbInner) {
                           listServices
                              .getListValues(listName)
                              .then(function (data) {
                                 _.each(data.docs, function (item) {
                                    collection.push(item);
                                 });
                                 cbInner();
                              })
                              .catch(function (err) {
                                 cbInner(err);
                              });
                        }, function (err) {
                           if (err) {
                              deferred.reject(err);
                           } else {
                              deferred.resolve(collection);
                           }
                        });
                        return deferred.promise;
                     }]
                  }
               }
            }
         })

         .state('app.attendance', {
            url: '/attendance',
            views: {
               menuContent: {
                  templateUrl: 'templates/activities/activity_session_attendance.html',
                  controller: 'attendanceCtlr',
                  controllerAs: 'vm',
                  resolve: {
                     participants: ["participantServices", "$redux", '_', function (participantServices, $redux, _) {
                        var location = $redux.getAction('selectedLocation');
                        return participantServices.getParticipants(_.get(location, '_id'));
                     }],
                     attendanceDoc: [
                        'attendanceServices',
                        '$redux',
                        function (attendanceServices, $redux) {
                           var session = $redux.getAction('selectedSession');
                           console.log("session", session);
                           return attendanceServices.getAttendanceBySession(session.sessionId);
                        }
                     ]
                  }
               }
            }
         })

         .state('app.activities', {
            url: '/activities',
            views: {
               'menuContent': {
                  templateUrl: 'templates/activities/activity_sessions.html',
                  controller: 'activitiesCtlr',
                  controllerAs: 'vm',
                  resolve: {
                     activities: [
                        "$q",
                        '$redux',
                        '$program_locations',
                        'async',
                        'activitySchedules',
                        'listServices',
                        'sessionServices',
                        'moment',
                        function ($q, $redux, $program_locations, async, activitySchedules, listServices, sessionServices, moment) {
                           var deferred = $q.defer();
                           async.waterfall([
                              //get location from program state
                              function (cb) {
                                 var location = $redux.getAction('selectedLocation');
                                 $program_locations.get(location._id)
                                    .then(function (locationDb) {
                                       cb(null, locationDb);
                                    })
                                    .catch(function (err) {
                                       cb(err);
                                    });
                              },
                              function (location, cb) {
                                 var selectedYear = $redux.getAction('activitiesYear');
                                 var activities = _.map(_.get(location, 'activities'), function (activity) {
                                    var activitiesFilter = _.filter(activity.schedules, function (item) {
                                       return _.isEqual(item.year, selectedYear);
                                    });
                                    return _.map(activitiesFilter, function (filtered) {
                                       return _.assign(_.clone(filtered), {
                                          activityId: activity._id,
                                          activityType: activity.activityType,
                                          activityName: activity.activityName
                                       });
                                    })
                                 });
                                 cb(null, _.flatten(activities));
                              },
                              function (activities, cb) {
                                 var activitiesCollection = [];
                                 async.each(activities, function (activity, cbInner) {
                                    activitySchedules.findByActivity(activity.reference)
                                       .then(function (data) {
                                          activitiesCollection.push(_.set(activity, 'schedule', data.docs));
                                          cbInner(null, data);
                                       })
                                       .catch(function (err) {
                                          cbInner(err);
                                       });
                                 }, function (err) {
                                    if (err) {
                                       cb(err);
                                    } else {
                                       cb(null, activitiesCollection);
                                    }
                                 });
                              },
                              function (activities, cb) {
                                 var activitiesCollection = [];
                                 async.each(activities, function (activity, cbInner) {
                                    async.parallel([
                                       //activityName
                                       function (cbParallel) {
                                          listServices
                                             .getListValueById(activity.activityName)
                                             .then(function (data) {
                                                cbParallel(null, data);
                                             })
                                             .catch(function (reason) {
                                                cbParallel(reason);
                                             });
                                       },
                                       //activityType
                                       function (cbParallel) {
                                          listServices
                                             .getListValueById(activity.activityType)
                                             .then(function (data) {
                                                cbParallel(null, data);
                                             })
                                             .catch(function (reason) {
                                                cbParallel(reason);
                                             });
                                       }
                                    ], function (err, data) {
                                       if (err) {
                                          cbInner(err);
                                       } else {
                                          activitiesCollection.push(_.assign(_.clone(activity), {
                                             activityName: data[0],
                                             activityType: data[1]
                                          }));
                                          cbInner();
                                       }
                                    });
                                 }, function (err) {
                                    if (err) {
                                       cb(err);
                                    } else {
                                       cb(null, activitiesCollection);
                                    }
                                 });
                              },
                              function (activities, cb) {
                                 var sessionsCollection = [];
                                 _.each(activities, function (activity) {
                                    var activityName = _.get(activity, 'activityName.value');
                                    var activityType = _.get(activity, 'activityType.value');
                                    var activityNameID = _.get(activity, 'activityType._id');
                                    var activityTypeID = _.get(activity, 'activityName._id');
                                    _.each(activity.schedule, function (schedule) {
                                       _.each(schedule.months, function (scheduleMonth) {
                                          var monthName = scheduleMonth.name;
                                          _.each(scheduleMonth.sessions, function (session) {
                                             var objectSession = _.assign({}, {
                                                monthName: monthName,
                                                activityName: activityName,
                                                activityType: activityType,
                                                activityNameID: activityNameID,
                                                activityTypeID: activityTypeID,
                                                sessionId: session
                                             });
                                             sessionsCollection.push(objectSession);
                                          });
                                       });
                                    });
                                 });
                                 cb(null, sessionsCollection);
                              },
                              function (sessions, cb) {
                                 var sessionsCollection = [];
                                 async.each(sessions, function (session, cbInner) {
                                    sessionServices.getSession(session.sessionId)
                                       .then(function (data) {
                                          sessionsCollection.push(_.set(session, 'sessionData', data));
                                          cbInner();
                                       })
                                       .catch(function (reason) {
                                          cbInner(reason);
                                       });
                                 }, function (err) {
                                    if (err) {
                                       cb(err);
                                    } else {
                                       cb(null, sessionsCollection);
                                    }
                                 });
                              },
                              function (sessions, cb) {
                                 moment.locale('es');
                                 var months = moment.months();
                                 var groupedMonths = _.groupBy(sessions, 'monthName');
                                 var collection = [];
                                 _.forOwn(groupedMonths, function (value, key) {
                                    collection.push(_.assign({}, {
                                       month: key,
                                       sessions: value
                                    }));
                                 });
                                 var sorted = _.sortBy(collection, function (session) {
                                    return _.indexOf(months, _.toLower(session.month));
                                 });
                                 cb(null, sorted);
                              }
                           ], function (err, activities) {
                              if (err) {
                                 console.log(err);
                                 deferred.reject(err);
                              } else {
                                 deferred.resolve(activities);
                              }
                           });
                           return deferred.promise;
                        }]
                  }
               }
            }
         })

         .state('app.surveys', {
            url: '/surveys',
            views: {
               menuContent: {
                  templateUrl: 'templates/surveys/list.html',
                  controller: 'surveysCtlr',
                  controllerAs: 'vm',
                  resolve: {
                     surveys: ["$redux", "$surveys", function ($redux, $surveys) {
                        console.log("surveys");
                        var location = $redux.getAction('selectedLocation');
                        return $surveys.find({
                           selector: {
                              programId: _.get(location, 'program._id', _.get(location, 'program', ''))
                           }
                        });
                     }]
                  }
               }
            }
         })
         .state('app.anons', {
            url: '/anonymous',
            views: {
               'menuContent': {
                  templateUrl: 'templates/surveys/anonApplications.html',
                  controller: 'anonInstancesController',
                  controllerAs: 'vm',
                  resolve: {
                     instances: ['$redux', '$q', '$anonInstances', function ($redux, $q, $anonInstances) {
                        var survey = $redux.getAction('selectedSurvey');
                        var location = $redux.getAction('selectedLocation');
                        return $anonInstances.find({
                           selector: {
                              survey: _.get(survey, '_id'),
                              programLocation: _.get(location, '_id')
                           }
                        });
                     }]
                  }
               }
            }
         })
         .state('app.surveySections', {
            url: '/survey/:_id/sections',
            views: {
               'menuContent': {
                  templateUrl: 'templates/surveys/print_sections.html',
                  controller: 'surveySectionController',
                  controllerAs: 'vm',
                  resolve: {
                     sections: ['$stateParams', '$sections', function ($stateParams, $sections) {
                        var surveyId = $stateParams._id;
                        return $sections.find({
                           selector: {
                              surveyId: surveyId
                           }
                        });
                     }]
                  }
               }
            }
         })
         .state('app.surveyQuestions', {
            url: '/section/:idSection/questions',
            views: {
               'menuContent': {
                  templateUrl: 'templates/surveys/print_questions_sections.html',
                  controller: 'surveyQuestionController',
                  controllerAs: 'vm',
                  resolve: {
                     questions: ['$stateParams', '$questions', 'async', '$q', '$sections', '_', "$lists", function ($stateParams, $questions, async, $q, $sections, _, $lists) {
                        var sectionId = $stateParams.idSection;
                        var deferred = $q.defer();
                        async.waterfall([
                           function (cb) {
                              $sections.get(sectionId, cb);
                           },
                           function (section, cb) {
                              var questions = _.get(section, 'questions');
                              var questionsCollection = [];
                              async.eachSeries(questions, function (questionId, cbInner) {
                                 $questions.get(questionId, function (err, questionDoc) {
                                    if (err) {
                                       cbInner(err);
                                    } else {
                                       questionsCollection.push(questionDoc);
                                       cbInner();
                                    }
                                 });
                              }, function (err) {
                                 cb(err, questionsCollection);
                              });
                           },
                           function (questions, cb) {
                              var questionCollection = [];
                              async.eachSeries(questions, function (question, cbInner) {
                                 if (_.has(question, 'valueSource.list.name')) {
                                    $lists.find({
                                          selector: {
                                             name: _.get(question, 'valueSource.list.name')
                                          }
                                       })
                                       .then(function (response) {
                                          var docs = _.get(response, 'docs', response);
                                          questionCollection.push(_.set(question, 'valueSource.values', docs));
                                          cbInner();
                                       })
                                       .catch(cbInner);
                                 } else {
                                    questionCollection.push(question);
                                    cbInner();
                                 }
                              }, function (err) {
                                 cb(err, questionCollection);
                              });
                           }
                        ], function (err, result) {
                           if (err) {
                              deferred.reject(err);
                           } else {
                              deferred.resolve(result);
                           }
                        });
                        return deferred.promise;
                     }]
                  }
               }
            }
         })

         .state('app.search', {
            url: '/search',
            views: {
               'menuContent': {
                  templateUrl: 'templates/search.html'
               }
            }
         })

         .state('app.browse', {
            url: '/browse',
            views: {
               'menuContent': {
                  templateUrl: 'templates/browse.html'
               }
            }
         })
         .state('app.playlists', {
            url: '/playlists',
            views: {
               'menuContent': {
                  templateUrl: 'templates/playlists.html',
                  controller: 'PlaylistsCtrl'
               }
            }
         })

         .state('app.single', {
            url: '/playlists/:playlistId',
            views: {
               'menuContent': {
                  templateUrl: 'templates/playlist.html',
                  controller: 'PlaylistCtrl'
               }
            }
         });
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/landing');
   });
