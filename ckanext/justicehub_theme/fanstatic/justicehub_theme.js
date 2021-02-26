// Read More effect.
// https://www.viralpatel.net/dynamically-shortened-text-show-more-link-jquery/
$(document).ready(function() {
	var showChar = 215;
	var ellipsestext = "...";
	var moretext = "more";
	var lesstext = "less";
	$('.more').each(function() {
		var content = $(this).html();

		if(content.length > showChar) {

			var c = content.substr(0, showChar);
			var h = content.substr(showChar-1, content.length - showChar);

			var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink">' + moretext + '</a></span>';

			$(this).html(html);
		}
	});

	$(".morelink").click(function(){
		if($(this).hasClass("less")) {
			$(this).removeClass("less");
			$(this).html(moretext);
		} else {
			$(this).addClass("less");
			$(this).html(lesstext);
		}
		$(this).parent().prev().toggle();
		$(this).prev().toggle();
		return false;
	});

      $('#howToUploadVideoContainer').on('hide.bs.modal', function() {
        $('#howToUploadVideoContainer iframe').attr('src', '')
      });

      $("#howToUploadVideoContainer").on('show.bs.modal', function() {
        $("#howToUploadVideoContainer iframe").attr('src', 'https://www.youtube.com/embed/7wrBtB_coJc');
      });
});


// tooltip enabled.
$('[data-toggle="tooltip"]').tooltip();

// counting animation for stats.
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

// bootstrap nav-tabs.
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
             //window.location.hash = this.hash;
              window.location = this;
        }
    };
});

// subscribe to mailing.
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
                    if ($(window).width() < 768) {
                        $('[data-toggle="popover"][class*="visible"]').data('bs.popover').options.content=msg;
                        $('[data-toggle="popover"][class*="visible"]').popover('show');
                    } else {
                        $('[data-toggle="popover"]').data('bs.popover').options.content=msg;
                        $('[data-toggle="popover"]').popover('show');
                    }
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
