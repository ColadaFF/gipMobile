angular.module('sigip.controllers', [])

   .controller('AppCtrl', function ($scope,
                                    $ionicModal,
                                    $timeout,
                                    $state,
                                    moment,
                                    $redux,
                                    $$messages,
                                    syncServices,
                                    $ionicLoading,
                                    $log,
                                    $rootScope,
                                    loginFactory) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      $scope.loggedIn = false;
      $scope.logout = logout;

      function logout() {
         syncServices
            .deleteUserFormDb()
            .then(function () {
               $redux.deleteAction('loggedUser');
               modelLogin.modal.show();
               $scope.loggedIn = false;
            })
            .catch(function (reason) {
               $$messages.simpleMessage("Ocurrió un error inesperado, por favor, intentelo más tarde.");
               $log.error(reason);
            });
      }

      function loadUser() {
         $ionicLoading.show({
            template: 'Espere...'
         });
         syncServices
            .loadUserFromDb()
            .then(function (data) {
               $log.info(data);
               if (_.size(data.rows) > 0) {
                  $redux.setAction('loggedUser', data.rows[0].doc);
                  $scope.loggedIn = true;
                  $ionicLoading.hide();
                  $$messages.simpleMessage("Bienvenido de vuelta.");

               } else {
                  modelLogin.modal.show();
                  $ionicLoading.hide();
               }
            })
            .catch(function (reason) {
               $$messages.simpleMessage("Error al obtener el usuario, por favor, intentelo de nuevo más tarde.");
               $log.error(reason);
               $ionicLoading.hide();
            });

      }

      var modelLogin = $rootScope.$new();

      // Form data for the login modal
      modelLogin.loginData = {};

      $scope.activities = {
         year: moment().year()
      };

      $scope.syncData = function () {
         $ionicLoading.show({
            template: 'Sincronizando...'
         });
         syncServices
            .syncAll()
            .then(function (data) {
               $ionicLoading.hide();
               $$messages.simpleMessage("Datos sincronizados correctamente");
               $log.info(data);
            })
            .catch(function (reason) {
               $ionicLoading.hide();
               $$messages.simpleMessage("Error sincronizando los datos, por favor, intente más tarde.");
               $log.error(reason);
            });
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
      $ionicModal.fromTemplateUrl('templates/login.html', {
         scope: modelLogin
      }).then(function (modal) {
         modelLogin.modal = modal;
      });

      modelLogin.closeModal = function () {
         modelLogin.modal.hide();
      };

      $scope.openModalLogin = function () {
         modelLogin.modal.show();
      };

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
      modelLogin.doLogin = function () {
         loginFactory
            .login(modelLogin.loginData)
            .authenticate(
               {},
               function (data) {
                  console.log(data);
                  if (data.auth === false) {
                     $$messages.simpleMessage("Usuario y/o contraseña incorrectos.");
                  } else {
                     $redux.setAction("clientToken", data.data);
                     loginFactory
                        .getUserInfo(data.data)
                        .info({}, function (response) {
                           syncServices.saveUserDB(data.data, response.data);
                           $$messages.simpleMessage("Bienvenido");
                           modelLogin.modal.hide();
                        }, function (reason) {
                           $$messages.simpleMessage("Ocurrió un error inesperado, por favor, intentelo de nuevo más tarde.");
                           $log.error(reason);

                        });
                  }
                  $log.info(data);
               },
               function (reason) {
                  $log.error(reason);
               }
            );
      };


      loadUser();
      /*syncServices
         .cleanDbs()
         .then($log.info, $log.error);*/
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
