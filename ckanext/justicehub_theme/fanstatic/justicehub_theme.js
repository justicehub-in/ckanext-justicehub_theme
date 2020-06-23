$('[data-toggle="tooltip"]').tooltip();

// https://stackoverflow.com/a/23006629/3860168
$('.stats-big').each(function () {
    var $this = $(this);
    $({ value: 0 }).animate({ Counter: $this.text() }, {
    duration: 500, /* NOTE: this duration should later be increased if the count goes up. */
    easing: 'swing',
    step: function () {
      $this.text(Math.ceil(this.Counter));
    }
  });
});

ckan.module('justicehub_theme_tabs', function ($) {
    return {
        initialize: function () {

            // change the page location to a tab on first load if the url has a hash.
            this.onHashChange();

            // on every url hash change, load the relevant tab.
            window.onhashchange = this.onHashChange;

            // on clicking any tab, change the url hash.
            $('.nav-tabs li a').on('click', this.onTabClick);
        },

        onHashChange: function () {
            // https://stackoverflow.com/a/9393768/3860168
            hash = window.location.hash;
            $('.nav-tabs li a[href="'+hash+'"]').tab('show');
        },

        onTabClick: function () {
            // https://stackoverflow.com/a/9393768/3860168
            window.location.hash = this.hash;
        }
    };
});

ckan.module('justicehub_theme_subscribe', function ($) {
    return {
        initialize: function () {
            $('[data-toggle="popover"]').popover();

            function subscribeSubmit(event) {
                $('[data-toggle="popover"]').popover('hide');

                console.log(event);
                var url = event.target.action;
                var request = new XMLHttpRequest();

                request.open('POST', url, true);

                request.onload = function() {
                    // success
                    response = JSON.parse(request.response)

                    if (response.errors) {
                        msg = response.errors[0].message;
                        msg = "<i class='fa fa-times subscribe-error'></i> " + msg;

                    }
                    else if (response.status == 400 && response.errors==undefined) {
                        msg = response.detail.split('. ')[0];
                        msg = "<i class='fa fa-times subscribe-error'></i> " + msg;
                    }
                    else if (response.status == 'subscribed') {
                        msg = "You've been successfully Subscribed!";
                        msg = "<i class='fa fa-check subscribe-success'></i> " + msg;
                    }

                    console.log(msg);
                    $('[data-toggle="popover"]').data('bs.popover').options.content=msg;
                    $('[data-toggle="popover"]').popover('show');
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
