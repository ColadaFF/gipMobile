angular.module('sigip.controllers', [])

   .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $state, moment, $redux, $$messages) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      // Form data for the login modal
      $scope.loginData = {};

      $scope.activities = {
         year: moment().year()
      };

      $scope.activityFields = [
         {
            key: 'year',
            type: 'input',
            templateOptions: {
               type: "number",
               label: "Año",
               required: true
            },
            validators: {
               year: {
                  expression: function (viewValue) {
                     return viewValue <= moment().year();
                  },
                  message: '"No puedes utilizar un año mayor al actual: " + $viewValue'
               },
               length: {
                  expression: function (viewValue) {
                     return viewValue > 2000;
                  },
                  message: '"Año invalido: " + $viewValue'
               }
            }
         }
      ];
      $scope.goToActivities = function () {
         $redux.setAction("activitiesYear", $scope.activities.year);
         $state.go('app.activities');
         $scope.modal.hide();
      };

      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/activities/activity_year_modal.html', {
         scope: $scope
      }).then(function (modal) {
         $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeModal = function () {
         $scope.modal.hide();
      };

      // Open the login modal
      $scope.activitiesYear = function () {
         if ($redux.checkStateAction('selectedLocation')) {
            $scope.modal.show();
         } else {
            $$messages.simpleMessage("Debe seleccionar una ubicación para trabajar primero.");
         }
      };


      // Perform the login action when the user submits the login form
      $scope.doLogin = function () {
         console.log('Doing login', $scope.loginData);

         // Simulate a login delay. Remove this and replace with your login
         // code if using a login system
         $timeout(function () {
            $scope.closeLogin();
         }, 1000);
      };
   })

   .controller('PlaylistsCtrl', function ($scope) {
      $scope.playlists = [
         {title: 'Reggae', id: 1},
         {title: 'Chill', id: 2},
         {title: 'Dubstep', id: 3},
         {title: 'Indie', id: 4},
         {title: 'Rap', id: 5},
         {title: 'Cowbell', id: 6}
      ];
   })

   .controller('PlaylistCtrl', function ($scope, $stateParams) {
   });
