'use strict';

angular.module('project', ['ngRoute'])
.value('api', 'api/submit.php')
.value('msg', 'message')
.config(['$sceProvider', '$routeProvider', '$locationProvider', function($sceProvider, $routeProvider, $locationProvider) {
  // 如果要讓舊IE支援(包含相容性檢視)，需要禁用 SCE ，因為 $sce does not support IE7
  $sceProvider.enabled(false);
  // 另外 IE6 需要使用 $location.path('/tp1'); 這種方式才能切換頁面，直接href="#/tp1"是沒用的

  // 設置 route
  $routeProvider.
  when('/p1', {
    controller:'p1Controller',
    templateUrl:'page1.html'
  }).
  when('/p2', {
    controller:'p2Controller',
    templateUrl:'page2.html'
  }).
  otherwise({
    redirectTo: '/p1'
  });
  //$locationProvider.html5Mode(true).hashPrefix("!")
}])



.controller('htmlCtrl', ['$scope', '$compile', '$location', 'api', 'msg' ,function($scope, $compile, $location, api, msg) {
  // api = 'api/submit.php'
  console.log(api, ' & ', msg);
  //$location.path('/a1');
}])



.controller('p1Controller', ['$scope', '$location', '$timeout' ,function($scope, $location, $timeout) {

}])


.controller('p2Controller', ['$scope', '$location', '$timeout' ,function($scope, $location, $timeout) {

}]);