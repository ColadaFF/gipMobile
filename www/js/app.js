angular.module('sigip', ['ionic', 'sigip.controllers', 'formly', 'sigipFormly', 'pouchdb', 'ionic-toast'])

   .run(function ($ionicPlatform, formlyConfig) {
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
      });

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
                     participant: ["$redux", function ($redux) {
                        return $redux.getAction('selectedParticipant');
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
