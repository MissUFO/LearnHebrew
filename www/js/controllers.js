angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    $scope.btnShare = function () {

        if (window.plugins.socialsharing != undefined) {
            window.plugins.socialsharing.share(
              SOCIAL_MSG,
              SOCIAL_SUB,
              SOCIAL_IMG,
              SOCIAL_URL);
        }

    };

})

.controller('HomeCtrl', function ($scope, $state) {
        
    $scope.btnClick = function () {

        $state.go('app.words-index');

    };
})

.controller('PurchaseCtrl', function ($scope, $state, inappService) {

    $scope.isFullVersion = inappService.checkVersion();
   
    $scope.btnBuyFull = function () {

        try
        {
            inappService.initStore().then(function () {
                if (inappService.checkVersion() == 1)
                    $state.go('app.words-index');
                else
                    $state.go('app.purchase');
            });

        } catch (e) {
            if (inappService.checkVersion() == 1)
                $state.go('app.words-index');
            else
                $state.go('app.purchase');
        }
    };

    $scope.btnRestorePurchase = function () {

        try
        {
            inappService.restorePurchase().then(function () {
                if (inappService.checkVersion() == 1)
                    $state.go('app.words-index');
                else
                    $state.go('app.purchase');
            });

        } catch (e) {
            if (inappService.checkVersion() == 1)
                $state.go('app.words-index');
            else
                $state.go('app.purchase');
        }
       
    };

})

.controller('ContactCtrl', function ($scope, $http, $ionicLoading, $ionicHistory, $timeout, $state) {

    $scope.btnClick = function () {

        var body = document.getElementById("msg").value;
        var namefrom = document.getElementById("namefrom").value;
        var mailfrom = document.getElementById("mailfrom").value;
        if (body == "" && namefrom == "" && mailfrom == "") {
            $ionicLoading.show({
                template: 'Please, complete this form!', noBackdrop: true, duration: 1000
            });

            return;
        }

        try {
            var soapRequest =
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><sendMail xmlns="http://tempuri.org/">' +
                '<sSvcName>3DHEBREW</sSvcName>' +
                '<sCode>$erv1cePwd</sCode>' +
                '<sToAddress>' + MAIL_TO + '</sToAddress>' +
                '<sSubject>' + MAIL_SUBJ_NEW + '</sSubject>' +
                '<sMessage>Name: ' + namefrom + '&lt;br&gt;' +
                'Email: ' + mailfrom + '&lt;br&gt;' +
                'Message: ' + body + '</sMessage>' +
                '</sendMail></s:Body></s:Envelope>';

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', MAIL_wsUrl, true);

            xmlhttp.setRequestHeader("Content-Type", "text/xml;charset=UTF-8");
            xmlhttp.setRequestHeader('SOAPAction', MAIL_wsAction);

            xmlhttp.send('<?xml version="1.0" encoding="utf-8" ?>' + soapRequest);
            xmlhttp.onreadystatechange = function () {

                if (!xmlhttp.status || xmlhttp.status == 200) {
                    $ionicLoading.show({
                        template: 'Your message has been sent!', noBackdrop: true, duration: 1000
                    });

                } else {
                    $ionicLoading.show({
                        template: 'Your message has not been sent!', noBackdrop: true, duration: 1000
                    });
                }

                $timeout(function () {
                    //$ionicHistory.goBack(-1);
                    $state.go('app.home');
                }, 1000);
            };
        } catch (e) {
            //$ionicHistory.goBack(-1);
            $state.go('app.home');
        }
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
            template: '<ion-spinner class="ion-loading-a"></ion-spinner><p class="loading-p">Loading...</p>',
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

        $scope.isFullVersion = inappService.checkVersion();

        $scope.currentSearchValue = "";
        document.getElementById("searchKey").value = $scope.currentSearchValue;

        $scope.words = $scope.allwords;
    };

    $scope.isSelected = function (word) {

        $scope.isFullVersion = inappService.checkVersion();

        var result = false;

        if(word.selected == 1)
            result = true;
        else if ($scope.isFullVersion == 1)
            result = true;
        else if (word.selected == 0)
        {
            var selected_words = 0;
            if (window.localStorage.getItem(SELECTED_WORDS_KEY) != undefined && window.localStorage.getItem(SELECTED_WORDS_KEY) != null && window.localStorage.getItem(SELECTED_WORDS_KEY) != "") {
                selected_words = window.localStorage.getItem(SELECTED_WORDS_KEY).split(',');
                       
                var isAvailable = selected_words.filter(function (obj) {
                    return obj == word.id;
                });

                if (isAvailable != null && isAvailable != undefined && isAvailable.length != 0)
                    result = true;
           }
        }

        return result;        
    };

    $scope.gotoWordConventional = function (url, id, selected) {
        
        try
        {
            $scope.isFullVersion = inappService.checkVersion();

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

            //if word for free or user have full version
            if (selected == 1 || $scope.isFullVersion == 1) {
                $state.go('app.word-conventional', { wordId: id });
            } else {

                //if it's payble word
                if (selected == 0) {

                    var counter = 0;
                    var selected_words = [];
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

                                    creditPopup.close();
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

                            try
                            {
                                //do something to buy
                                inappService.initStore();

                            } catch (e)
                            {

                            }
                            if(inappService.checkVersion()==1)
                                $state.go('app.word-conventional', { wordId: id });
                            else
                                $state.go('app.words-index');
                        }
                    }
                }
            }

        }catch(e)
        {
        }

    };
})

.controller('WordConventionalCtrl', function ($scope, $ionicLoading, $ionicHistory, $ionicPopup, $stateParams, MediaManager, specialOffer, singleWordService) {

    $scope.word = null;
    $scope.id = $stateParams.wordId;
    $scope.pagename = "conventional";

    //$scope.audiopath = AUDIO_PATH + $scope.id + ".wma";

    $scope.isLoaded = false;
    $scope.loadingIndicator = $ionicLoading.show({
        template: '<ion-spinner class="ion-loading-a"></ion-spinner><p class="loading-p">Loading...</p>',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    //$scope.track = {
    //    id: 0,
    //    url: AUDIO_PATH + $scope.id + '.wma',
    //    artist: 'noname',
    //    title: 'No Name',
    //    art: ''
    //};
        
    $scope.playAudio = function () {

        var audio = new Audio();
        audio.src = AUDIO_PATH + $scope.id + '.mp3'//'.wma';
        audio.loop = false;
        audio.play();

        //MediaManager.playTrack($scope.track);
    }

    $scope.playAudio2 = function () {

        var audio = new Audio();
        audio.src = "http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3";
        audio.loop = false;
        audio.play();
    }
    

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

    $scope.getClass = function (objects) {
        var total = 0;
        if (objects != null && objects != undefined)
            total = objects.length;

        var css = "conventional-meaning-" + total;

        return css;
    }

    var num = 1;
    $scope.getWidth = function (objects) {
        var total = 0;
        if (objects != null && objects != undefined)
            total = objects.length;

        var percent = num * 100 / total;

        return percent+"%";
    }

    var loadedImg = 0;   
    $scope.imgLoadCompleted = function (pagename) {

        $scope.pagename = pagename;
        loadedImg++;       
    }
            
    if ($scope.word == null) {

        singleWordService.getData($scope.id).then(function (word) {
            if (word != null && word != undefined) {
                $scope.word = word;
                window.localStorage.setItem($scope.id, JSON.stringify($scope.word));
            }
        });
    }

    if ($scope.word == null) {
        if (window.localStorage.getItem($scope.id) != undefined) {
            $scope.word = JSON.parse(window.localStorage.getItem($scope.id));           
        }
    }

    var counter = 0;
    var everythingLoaded = setInterval(function () {
        if (/loaded|complete/.test(document.readyState)) {

            if ($scope.word != null) {
                if (
                    ($scope.word.conventionalmeaning.length * 2 <= loadedImg && $scope.pagename == "conventional") ||
                    ($scope.word.numericmeaning.length <= loadedImg && $scope.pagename == "numeric") ||
                    ($scope.word.pictorialmeaning.length * 2 <= loadedImg && $scope.pagename == "pictorial") ||
                    counter >= 50)
                {

                    clearInterval(everythingLoaded);
                    $scope.loadingIndicator.hide();
                    $scope.isLoaded = true;

                    specialOffer.incrementCounter();
                    if (specialOffer.needToShow()) {
                        specialOffer.show({
                            id: ANDRIOD_PACKAGE_NAME,
                            title: 'Rate 3D Hebrew Companion',
                            text: 'If you enjoy this app please take a moment to rate it!',
                            agreeLabel: 'Rate It Now',
                            remindLabel: 'Remind Me Later',
                            declineLabel: 'No, Thanks'
                        });
                    }

                }
            }
        }       
        counter++;

    }, 100);
    
});
