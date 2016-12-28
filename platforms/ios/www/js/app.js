
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-audio'])

.run(function ($ionicPlatform, $ionicPopup, wordsService, inappService) {
    $ionicPlatform.ready(function () {
        
        if (!inappService.checkSimulator()) {
            store.verbosity = store.DEBUG;

            store.register({
                id: INAPP_ANDRIOD_PRODUCT_ID,
                alias: INAPP_ANDRIOD_PRODUCT_ALIAS,
                type: store.NON_CONSUMABLE
            });

            store.refresh();
        }

        //preload
        wordsService.getData().then(function (words) {
            var data = words.data.wordlist;
            window.localStorage.setItem(WORDS_KEY, JSON.stringify(data));
        });
            
    });
})

//.config([
//  '$compileProvider',
//  function ($compileProvider) {
//      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
//  }
//])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            cache: false,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })
        .state('app.home', {
            cache: false,
            url: "/home",
            views: {
                'menuContent': {
                    templateUrl: "templates/home.html",
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('app.about', {
            cache: false,
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "templates/about.html"
                }
            }
        })
       .state('app.contact', {
            cache: false,
            url: "/contact",
            views: {
                'menuContent': {
                    templateUrl: "templates/contact.html",
                    controller: 'ContactCtrl'
                }
            }
       })
         .state('app.purchase', {
             url: "/purchase",
             cache: false,
             views: {
                 'menuContent': {
                     templateUrl: "templates/purchase.html",
                     controller: 'PurchaseCtrl'
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

.factory('inappService', function ($ionicPopup, $state) {
        
    return {
        initStore: function() {
            if (!this.checkSimulator()) {
                // Enable maximum logging level
                
                var product = store.get(INAPP_ANDRIOD_PRODUCT_ALIAS);
                if (product != null && product != undefined) {
                    if (!product.owned) {
                        //product.description
                        var productPopup = $ionicPopup.confirm({
                            title: product.title,
                            template: "You have no more available word credits. By purchasing the full app, you'll have access to all words in the dictionary, and all new words added. As well, your purchase further enables Rock Island Books to continue providing Gospel-focused media to reach the world.<br/>Buy full app now for " + product.price + "?",
                        });
                        productPopup.then(function (res) {
                            if (res) {

                                store.order(product.id);
                                store.refresh();
                                                               
                                window.localStorage.setItem(FULL_VERSION_KEY, 1);

                            } else {
                                //if cancel do nothing
                            }
                        });
                    }
                }
         
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).purchased(function (order) {

                    //app unlock
                    order.finish();
                    store.refresh();
                    this.checkVersion();                   

                })
                .refunded(function () {

                    window.localStorage.setItem(FULL_VERSION_KEY, 0);

                    this.checkVersion();
                  
                });

                // When purchase of the full version is approved, show an alert and finish the transaction.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).approved(function (order) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Completed successesfylly',
                        template: 'You just unlocked the FULL VERSION!'
                    });

                    order.finish();
                    store.refresh();
                    this.checkVersion();
                  
                });
  
                // The play button can only be accessed when the user owns the full version.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).updated(function (product) {

                    console.log("The full version updated to " + (product.owned ? "owned" : "not owned"));
                    store.refresh();

                    this.checkVersion();

                });

                // Deal with errors
                store.error(function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: 'ERROR ' + error.code + ': ' + error.message
                    });
                });
               
                store.refresh();
            }
        },

        restorePurchase: function () {
            if (!this.checkSimulator()) {
               
                var product = store.get(INAPP_ANDRIOD_PRODUCT_ALIAS);
                if (product != null && product != undefined) {
                    if (product.owned) {
                        
                        var productPopup = $ionicPopup.confirm({
                            title: product.title,
                            template: "If you already bought the app and have reinstalled it, you can restore the previous purchase. You'll have access to all words in the dictionary, and all new words added. As well, your purchase further enables Rock Island Books to continue providing Gospel-focused media to reach the world.<br/>Restore you purchase now?",
                        });

                        productPopup.then(function (res) {
                            if (res) {

                                //store.order(product.id);
                                //store.refresh();

                                window.localStorage.setItem(FULL_VERSION_KEY, 1);

                            } else {
                                //if cancel do nothing
                            }
                        });

                    }else
                    {
                        this.initStore();
                    }
                }

                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).purchased(function (order) {
                                        
                    order.finish();
                    store.refresh();
                    this.checkVersion();

                })
                .refunded(function () {

                    window.localStorage.setItem(FULL_VERSION_KEY, 0);

                    this.checkVersion();

                });

                // When purchase of the full version is approved, show an alert and finish the transaction.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).approved(function (order) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Completed successesfylly',
                        template: 'You just unlocked the FULL VERSION!'
                    });

                    order.finish();
                    store.refresh();
                    this.checkVersion();

                });

                // The play button can only be accessed when the user owns the full version.
                store.when(INAPP_ANDRIOD_PRODUCT_ALIAS).updated(function (product) {

                    console.log("The full version updated to " + (product.owned ? "owned" : "not owned"));
                    store.refresh();

                    this.checkVersion();

                });

                // Deal with errors
                store.error(function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: 'ERROR ' + error.code + ': ' + error.message
                    });
                });

                store.refresh();
            }
        },
        checkVersion: function () {

            var fullversion = 0;
                       
            var product = store.get(INAPP_ANDRIOD_PRODUCT_ALIAS);
            if (product != null && product != undefined) {
                if (product.owned) {
                    fullversion = 1;                    
                } else {
                    fullversion = 0;
                }          

                if(fullversion==0 && window.localStorage.getItem(FULL_VERSION_KEY)!=undefined)
                    fullversion = window.localStorage.getItem(FULL_VERSION_KEY);

                window.localStorage.setItem(FULL_VERSION_KEY, fullversion);
            }          

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

.factory('specialOffer', function ($q, $ionicPopup) {
       
        return {

            show: function (config) {

                var rate = $ionicPopup.show({
                    template: config.text,
                    title: config.title,
                    cssClass: "popup-vertical-buttons",
                    buttons: [
                            {
                                text: config.agreeLabel,
                                onTap: function (e) {
                                        
                                    window.localStorage.setItem(RATE_WORDS_FIRST_TIME_KEY, -1);

                                    rate.close();
                                    return true;
                                }
                            },
                            {
                                text: config.remindLabel,
                                onTap: function (e) {

                                    rate.close();
                                    return false;
                                }
                            },
                            {
                                text: config.declineLabel,
                                onTap: function (e) {

                                    window.localStorage.setItem(RATE_WORDS_FIRST_TIME_KEY, -1);

                                    rate.close();
                                    return false;
                                }
                            },
                    ]
                });

                rate.then(function (res) {
                    if (res) {
                        var isIOS = ionic.Platform.isIOS();
                        if (isIOS)
                            window.open('itms-apps://itunes.apple.com/en/app/id' + IOS_PACKAGE_NAME, '_system');
                        else
                            window.open('market://details?id=' + ANDRIOD_PACKAGE_NAME, '_system');
                    }
                });                                

            },
            needToShow: function () {
                var current_counter = 0;
                var limit = 0;

                if (window.localStorage.getItem(RATE_WORDS_FIRST_TIME_KEY) != undefined) {
                    limit = parseInt(window.localStorage.getItem(RATE_WORDS_FIRST_TIME_KEY));
                }

                if (limit == 0) {
                    limit = 5; //first time show after 5 opened words
                    window.localStorage.setItem(RATE_WORDS_FIRST_TIME_KEY, limit);
                }

                if (window.localStorage.getItem(RATE_WORDS_KEY) != undefined) {
                    current_counter = parseInt(window.localStorage.getItem(RATE_WORDS_KEY));
                }
               
                if (current_counter >= limit && limit!=-1) {

                    window.localStorage.setItem(RATE_WORDS_FIRST_TIME_KEY, RATE_WORDS_LIMIT);
                    window.localStorage.setItem(RATE_WORDS_KEY, 0);

                    return true;
                }
                else
                    return false;
                
            },
            incrementCounter: function () {
                var counter = 0;

                if (window.localStorage.getItem(RATE_WORDS_KEY) != undefined) {
                    counter = parseInt(window.localStorage.getItem(RATE_WORDS_KEY));
                }

                counter++;

                window.localStorage.setItem(RATE_WORDS_KEY, counter);
            }

        };

    })

.directive('imageonload', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('load', function () {
                //call the function that was passed
                scope.$apply(attrs.imageonload);
            });
        }
    };
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


