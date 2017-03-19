(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", function () {
        init();
    });

    function init() {
        /* Code common to both OpenFin and browser to go above.
         Then the specific code for OpenFin and browser only to be
         targeted in the try/catch block below.
         */
        try {
            fin.desktop.main(function () {
                initWithOpenFin();
            })
        } catch (err) {
            initNoOpenFin();
        }
    };

    function initWithOpenFin() {
        updateAdapterIndicator();
        setVersionNumber();
        setLearnMoreEventHandler();
        sendAppReadyMessage();
        var app = fin.desktop.Application.getCurrent();

        app.addEventListener("run-requested", function (event) {
            sendAppReadyMessage();
        }, function () {
            console.log("The registration was successful");
        }, function (reason) {
            console.log("failure: " + reason);
        });
    }

    function initNoOpenFin() {
        console.log("OpenFin is not available - you are probably running in a browser.");
        // Your browser-only specific code to go here...
    }

    //set the adapter ready UI indicator
    var updateAdapterIndicator = function () {
        var statusIndicator = document.querySelector('#status-indicator');
        statusIndicator.classList.toggle("online");
    };

    //set the OpenFin version number on the page
    var setVersionNumber = function () {
        var versionNumberContainer = document.querySelector('#version-number-container'),
            ofVersion = document.querySelector('#of-version');

        fin.desktop.System.getVersion(function (version) {
            ofVersion.innerText = version;
            versionNumberContainer.classList.toggle('invisible');
        });
    };

    //add the event listener for the learn more button.
    var setLearnMoreEventHandler = function () {
        var learnMoreButton = document.querySelector('#learn-more');

        learnMoreButton.addEventListener('click', function () {
            fin.desktop.System.openUrlWithBrowser('https://openfin.co/developers/javascript-api/');
        });
    };

    var sendAppReadyMessage = function () {
        fin.desktop.InterApplicationBus.publish("application:ready", {
            ready: true
        });
    };

}());
