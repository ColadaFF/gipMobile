(function () {
   "use strict";
   function alertsCtlr(alerts, $redux, $log, $state, $alerts, $ObjectId, moment) {
      var vm = this;
      vm.alerts = _.get(alerts, 'docs', []);
      vm.selectAlert = selectAlert;
      vm.createAlert = createAlert;

      function selectAlert(alert) {
         $redux.setAction('selectedAlert', alert);
         $state.go('app.alert');
      }

      function createAlert() {
         var location = $redux.getAction('selectedLocation');
         var code = _
            .chain(_.get(location, 'location.value'))
            .split('')
            .take(3)
            .join('')
            .toUpper()
            .value();
         var id = $ObjectId.generate();
         $alerts
            .put({
               _id: id,
               code: code + moment().format('YYYYMMDD'),
               date: moment().toISOString(),
               timeLine: [],
               programLocation: location._id
            }, function (err, result) {
               if (err) {
                  $log.error(err);
               } else {
                  $alerts
                     .get(id)
                     .then(function (doc) {
                        $redux.setAction('selectedAlert', doc);
                        $state.go('app.alert');
                     })
                     .catch($log.error);
                  $log.info(result);
               }
            })
         ;
      }
   }

   alertsCtlr.$inject = ['alerts', '$redux', "$log", "$state", '$alerts', '$ObjectId', 'moment'];

   angular.module('sigip.controllers').controller("alertsCtlr", alertsCtlr);
}());
