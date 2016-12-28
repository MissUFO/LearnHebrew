
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function ($ionicPlatform, $ionicPopup, wordsService) {
    $ionicPlatform.ready(function () {
        
        //preload
        wordsService.getData().then(function (words) {
            var data = words.data.wordlist;
            window.localStorage.setItem(WORDS_KEY, JSON.stringify(data));
        });
            
    });
})

.config([
  '$compileProvider',
  function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
  }
])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.about', {
        url: "/about",
        views: {
            'menuContent': {
                templateUrl: "templates/about.html"
            }
        }
    })
      .state('app.words-index', {
          url: "/words-index",
          views: {
              'menuContent': {
                  templateUrl: "templates/words-index.html",
                  controller: 'WordsIndexCtrl'
              }
          }
      })

    .state('app.word-conventional', {
        url: "/words-index/word-conventional/:wordId",
        views: {
            'menuContent': {
                templateUrl: "templates/word-conventional.html",
                controller: 'WordConventionalCtrl'
            }
        }
    })

    .state('app.word-numeric', {
        url: "/words-index/word-numeric/:wordId",
        views: {
            'menuContent': {
                templateUrl: "templates/word-numeric.html",
                controller: 'WordConventionalCtrl'
            }
        }
    })

    .state('app.word-pictorial', {
        url: "/words-index/word-pictorial/:wordId",
        views: {
            'menuContent': {
                templateUrl: "templates/word-pictorial.html",
                controller: 'WordConventionalCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
})

.factory('inappService', function ($ionicPopup) {
        
    return {
        initStore: function() {
            if (!this.checkSimulator()) {
                // Enable maximum logging level
                store.verbosity = store.DEBUG;       
              
                store.register({
                    id: INAPP_ANDRIOD_PRODUCT_ID,
                    alias: INAPP_ANDRIOD_PRODUCT_ALIAS,
                    type:   store.NON_CONSUMABLE
                }); 

                // When any product gets updated, refresh the HTML
                store.when("product").updated(function (p) {
                    //show popup
                    if (p.valid) {
                        var productPopup = $ionicPopup.confirm({
                            title: p.title,
                            template: p.description + '. Buy for ' + p.price,
                        });
                        productPopup.then(function (res) {
                            if (res) {
                                store.order(p.id);
                            } else {
                                //if Cancel do nothing
                            }
                        });
                    }
                });
               
                // Deal with errors
                store.error(function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: 'ERROR ' + error.code + ': ' + error.message
                    });
                });
         
                // When purchase of the full version is approved, show an alert and finish the transaction.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).approved(function (order) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Completed successesfylly',
                        template: 'You just unlocked the FULL VERSION!'
                    });

                    order.finish();
                });
  
                // The play button can only be accessed when the user owns the full version.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).updated(function (product) {
                    console.log("The full version updated to " + (product.owned ? "owned" : "not owned"));
                });

                // When the store is ready all products are loaded and in their "final" state.
                // Note that the "ready" function will be called immediately if the store is already ready.
                // When the store is ready, activate the "refresh" button;
                store.ready(function() {
                    console.log("The store is ready");
                });

                // Refresh the store.
                // This will contact the server to check all registered products validity and ownership status.
                // It's fine to do this only at application startup, as it could be pretty expensive.
                store.refresh();
            }
        },

        checkVersion: function () {

            var fullversion = 0;
            //store.
            window.localStorage.setItem(FULL_VERSION_KEY, fullversion);

            //fullversion = 1;
            //window.localStorage.setItem(FULL_VERSION_KEY, fullversion);

            return fullversion;
        },

        checkSimulator: function () {
            if (window.navigator.simulator === true) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Store error',
                    template: 'This plugin is not available in the simulator.'
                });
                return true;
            } else if (window.store === undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Store error',
                    template: 'Plugin not found. Maybe your device does not support this plugin.'
                });
                return true;
            } else {
                return false;
            }
        }
    }
})

.factory('wordsService', function ($http, $ionicPopup) {
        var words = [];

        return {
            getData: function () {
               
                return $http.get(SOURCE_URL + WORDS_JSON).success(function (response) {
                    words = response;
                    return words;
                }).error(function (e) {
                    var alertPopup = $ionicPopup.alert({
                            title: 'Internet connection is required!',
                            template: 'This application requires an Internet connection to access a new word from the dictionary.'
                    });
                   
                    return words;
                });
            }
        }
})

.factory('singleWordService', function ($http) {
        
    var word;
    var src;

        return {
            getData: function (id) {
              
                return $http.get(SOURCE_URL + id + ".json").then(function (response) {
                    word = response.data;
                    return word;
                });
            },
            cacheImg: function (url) {

                //$ImageCacheFactory.Cache(url); 
                //.then(function () {
                //    console.log("Images done loading!");
                //}, function (failed) {
                //    console.log("An image filed: " + failed);
                //});
            }
        }
    })

.factory('logicService', function ($q) {

    return {

        findAll: function(Words) {

            var deferred = $q.defer();
            deferred.resolve(Words);
            return deferred.promise;
        },

        findByName: function(Words, searchKey) {

            var deferred = $q.defer();
            var results = Words.filter(function (element) {
                var title = element.name;
                return title.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });

            deferred.resolve(results);
            return deferred.promise;
        },

        findByLetter: function (Words, searchKey) {

            var deferred = $q.defer();
            var results = Words.filter(function (element) {
                var title = element.name.toLowerCase();
                return (title.substr(0, 1).toLowerCase() == searchKey.toLowerCase());
            });

            deferred.resolve(results);
            return deferred.promise;
        }
    }
})
.directive('ionSearch', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            getData: '&source',
            model: '=?',
            search: '=?filter'
        },
        link: function (scope, element, attrs) {
            attrs.minLength = attrs.minLength || 0;
            scope.placeholder = attrs.placeholder || '';
            scope.search = { value: '' };

            if (attrs.class)
                element.addClass(attrs.class);
                        
            if (attrs.source) {
                scope.$watch('search.value', function (newValue, oldValue) {
                    if (newValue.length >= attrs.minLength) {
                        scope.getData({ str: newValue }).then(function (results) {
                            scope.model = results;
                        });
                    } else {
                        scope.model = [];
                    }
                });
            }

            scope.clearSearch = function () {
                scope.search.value = '';
            };
            
            scope.showAllWords = function ()
            {               
                scope.$parent.showAllWords();
            };           
        },
        template: '<div class="item-input-wrapper" >' +
                    '<table><tr><td class="first-cell"><i class="icon ion-android-search"></i>' +
                    '</td><td class="second-cell"><input name="searchKey" id="searchKey" type="search" ng-click="clearSearch()" placeholder="{{placeholder}}" ng-model="search.value"  >' +
                    '</td><td width="10px;"><div id="allDictionary" name="allDictionary" class="book-dark-button" ng-click="showAllWords()" ><img src="images/book-dark-icon.png"></div>' +
                  '</td></tr><table></div>'
    };
  
});


