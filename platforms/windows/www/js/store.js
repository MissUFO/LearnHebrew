function initStore(ionicPopup) {
    if (!this.checkSimulator(ionicPopup)) {
        // Enable maximum logging level
        store.verbosity = store.DEBUG;       
              
        store.register({
            id: INAPP_ANDRIOD_PRODUCT_ID,
            alias: INAPP_ANDRIOD_PRODUCT_ALIAS,
            type:   store.NON_CONSUMABLE
        }); 

        // When any product gets updated, refresh the HTML
        store.when("product").updated(function (p) {
            var container = document.body;
            var elId = p.id.split(".")[3];
            var el = document.getElementById(elId);
            if (!el) {
                container.innerHTML += '<div id="'+elId+'"></div>';
                el = document.getElementById(elId);
            }
                
            if (!p.loaded) {
                el.innerHTML += '<h3>...</h3>';
            } else if (!p.valid) {
                el.innerHTML += '<h3>' + p.alias + ' Invalid</h3>';
            } else if (p.valid) {
                var html = "<h3>" + p.title + "</h3>" + "<p>" + p.description + "</p>";
                if (p.canPurchase) {
                    html += "<button class='button' onclick='store.order(\"" + p.id + "\")'>Buy for " + p.price + "</button>";
                }
                //                  el.innerHTML = html;
                el.innerHTML = JSON.stringify(p);
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
}

function checkSimulator(ionicPopup) {
    if (window.navigator.simulator === true) {
        var alertPopup = ionicPopup.alert({
            title: 'Store error',
            template: 'This plugin is not available in the simulator.'
        });
        return true;
    } else if (window.store === undefined) {
        var alertPopup = ionicPopup.alert({
            title: 'Store error',
            template: 'Plugin not found. Maybe your device does not support this plugin.'
        });
        return true;
    } else {
        return false;
    }
}