angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

})

.controller('HomeCtrl', function ($scope, $window, $state) {
        
    $scope.btnClick = function () {

        $window.location.href = '#/app/words-index';

    };
})

.controller('WordsIndexCtrl', function ($scope, $state, $ionicLoading, $ionicPopup, $ionicHistory, wordsService, inappService, logicService, singleWordService) {

    $scope.characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z"];

    $scope.words = [];
    $scope.allwords = [];
    $scope.currentSearchValue = "";
    $scope.isFullVersion = inappService.checkVersion();  

    if (window.localStorage.getItem(WORDS_KEY) != undefined) {

        $scope.allwords = JSON.parse(window.localStorage.getItem(WORDS_KEY));
        $scope.words = $scope.allwords;

    }

    if ($scope.allwords == null) {

        $scope.loadingIndicator = $ionicLoading.show({
            //content: 'Loading Data',
            template: 'Loading...',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 500
        });

        wordsService.getData().then(function (words) {
            $scope.allwords = words.data.wordlist;
            window.localStorage.setItem(WORDS_KEY, JSON.stringify($scope.allwords));
        }).then(function () {
            logicService.findAll($scope.allwords).then(function (Words) {
                $scope.words = Words;
                $scope.loadingIndicator.hide();
            });
        });
    }


    $scope.getWorldByName = function (str) {

        $scope.currentSearchValue = str;

        logicService.findByName($scope.allwords, str).then(function (Words) {
            $scope.words = Words;
        });

    };

    $scope.getWorldByLetter = function (str) {

        $scope.currentSearchValue = str;
        document.getElementById("searchKey").value = $scope.currentSearchValue;

        logicService.findByLetter($scope.allwords, str).then(function (Words) {
            $scope.words = Words;
        });

    };

    $scope.showAllWords = function () {

        $scope.currentSearchValue = "";
        document.getElementById("searchKey").value = $scope.currentSearchValue;

        $scope.words = $scope.allwords;
    };

    $scope.gotoWordConventional = function (url, id, selected) {

        var singleWord = null;
        
        singleWordService.getData(id).then(function (word) {
            if (word != null && word != undefined) {
                singleWord = word;
                window.localStorage.setItem(id, JSON.stringify(singleWord));
            }
        });        

        if (singleWord == null) {
            if (window.localStorage.getItem(id) != undefined) {
                singleWord = JSON.parse(window.localStorage.getItem(id));
            }
        }

        //if we have details for this word
        if (singleWord != null) {

            //if word for free or user have full version
            if (selected == 1 || $scope.isFullVersion == 1) {
                $state.go('app.word-conventional', { wordId: id });
            } else {

                //if it's payble word
                if (selected == 0) {

                    var counter = 0;
                    var selected_words = [];
                    //window.localStorage.setItem(SELECTED_WORDS_KEY, selected_words);
                    if (window.localStorage.getItem(SELECTED_WORDS_KEY) != undefined && window.localStorage.getItem(SELECTED_WORDS_KEY) != null && window.localStorage.getItem(SELECTED_WORDS_KEY)!="") {
                        selected_words = window.localStorage.getItem(SELECTED_WORDS_KEY).split(',');
                    }

                    counter = selected_words.length;

                    var isAvailable = selected_words.filter(function (obj) {
                        return obj == id;
                    });

                    //if the word not new - redirect
                    if (isAvailable != null && isAvailable != undefined && isAvailable.length != 0) {

                        $state.go('app.word-conventional', { wordId: id });
                        return;

                    } else {

                        //if user have a credits
                        if (counter < SELECTED_WORDS_LIMIT) {
                            //if it's new word                       
                            var remain = SELECTED_WORDS_LIMIT - counter;
                            //show popup
                            var creditPopup = $ionicPopup.confirm({
                                title: 'Credits remaining',
                                template: 'You have ' + remain + ' credit(s) remaining. Use 1 credit on this word? ',
                            });
                            creditPopup.then(function (res) {
                                if (res) {
                                    //increment credit
                                    selected_words.push(id);
                                    window.localStorage.setItem(SELECTED_WORDS_KEY, selected_words);
                                    //redirect
                                    $state.go('app.word-conventional', { wordId: id });
                                } else {
                                    //if Cancel do nothing
                                }
                            });
                        }
                        //if no more credits
                        if (counter >= SELECTED_WORDS_LIMIT) {
                            //show popup
                            var fullVersionPopup = $ionicPopup.confirm({
                                title: 'Credits remaining',
                                template: 'You have no more available credits. Buy full app?',
                            });
                            fullVersionPopup.then(function (res) {
                                if (res) {
                                    //do something to buy
                                    inappService.initStore();

                                } else {
                                    //if Cancel do nothing
                                }
                            });
                        }
                    }
                }
            }
        }

    };
})

.controller('WordConventionalCtrl', function ($scope, $ionicLoading, $ionicHistory, $stateParams, singleWordService) {

    $scope.word = null;
    $scope.id = $stateParams.wordId;

    $scope.loadingIndicator = $ionicLoading.show({
        //content: 'Loading Data',
        template: 'Loading...',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    $scope.getLetterImg = function (objects, key) {

        var source_item = objects.sources.filter(function (element) {
            var l = element.letter.toLowerCase();
            return (l.toLowerCase() == key.toLowerCase());
        });
        
        if (source_item != undefined && source_item.length > 0) {

            var url = SOURCE_IMG_URL + source_item[0].letterGraphic;
            return url;

        }
        else
            return "";
    }

    $scope.getPictureImg = function (objects, key) {

        var source_item = objects.sources.filter(function (element) {
            var l = element.letter.toLowerCase();
            return (l.toLowerCase() == key.toLowerCase());
        });
                
        if (source_item != undefined && source_item.length > 0) {
            var url = SOURCE_IMG_URL + source_item[0].letterPicture;
            return url;
        }
        else
            return "";
    }

    if ($scope.word == null) {

        singleWordService.getData($scope.id).then(function (word) {
            if (word != null && word != undefined) {
                $scope.word = word;
                window.localStorage.setItem($scope.id, JSON.stringify($scope.word));

                $scope.loadingIndicator.hide();
            }
        });
    }

    if ($scope.word == null) {
        if (window.localStorage.getItem($scope.id) != undefined) {
            $scope.word = JSON.parse(window.localStorage.getItem($scope.id));

            $scope.loadingIndicator.hide();
        }
    }
    
});
