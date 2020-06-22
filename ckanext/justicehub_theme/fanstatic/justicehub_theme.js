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
