ckan.module('justicehub_theme_subscribe', function ($) {
    return {
      initialize: function () {
        function subscribeSubmit(event) {
            console.log(event);
            var url = event.target.action;
            var request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.onload = function() { 
            // success
              console.log(request.responseText);
            };
          
            request.onerror = function() {
              // request failed
            };
          
            request.send(new FormData(event.target));
            event.preventDefault();
        }
        console.log("initialized");  
        document.getElementById("subscribe-form").addEventListener("submit", subscribeSubmit);
      }
    };
  });
  