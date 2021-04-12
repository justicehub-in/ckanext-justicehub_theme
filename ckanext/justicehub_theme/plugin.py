import ckanext.justicehub_theme.logic.action as jh_action
from ckanext.justicehub_theme.lib import helpers

import ckan.model as model
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import c


class Justicehub_ThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IPackageController)
    plugins.implements(plugins.IActions)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'justicehub_theme')

    # ITemplateHelpers

    def get_helpers(self):
        '''
        Register helper functions.
        '''
        # Template helper function names should begin with the name of the
        # extension they belong to, to avoid clashing with functions from
        # other extensions.
        return {
            'justicehub_theme_get_package_avg_downloads': helpers.get_package_avg_downloads,
            'justicehub_theme_package_activity_stream': helpers.package_activity_stream,
            'justicehub_theme_parse_json': helpers.parse_json,
            'justicehub_theme_get_assignee_user': helpers.get_assignee_user,
            'justicehub_theme_issue_vars': helpers.issues_vars,
            'justicehub_theme_is_org_admin': helpers.is_org_admin,
            'justicehub_theme_get_popular_groups': helpers.get_popular_groups,
            'justicehub_theme_pop_zip_resource': helpers.pop_zip_resource,
	    'justicehub_theme_show_linked_user': helpers.show_linked_user
        }

    #IActions
    def get_actions(self):
        temp = dict((name, function) for name, function
                    in jh_action.__dict__.items()
                    if callable(function))
        return temp


    # IPackageController

    def before_search(self, search_params):
        u'''Extensions will receive a dictionary with the query parameters,
        and should return a modified (or not) version of it.
        '''
        return search_params

    def before_view(self, package_dict):
        u'''Extensions will receive a dictionary with the query parameters,
        and should return a modified (or not) version of it.
        '''
        #for resource_dict in package_dict['resources']:
        #    resource_dict['downloads'] = helpers.get_resource_downloads(resource_dict)

        package_dict['tracking_summary'] = (
            model.TrackingSummary.get_for_package(package_dict['id']))

        # context = {'model': model, 'session': model.Session,
        #            'user': c.user, 'for_view': True,
        #            'auth_user_obj': c.userobj}
        # print(package_dict)
        # partner = toolkit.get_action('get_package_owner_details')(
        #         context,
        #         data_dict={'org_id': package_dict['owner_org']}
        # )
        # package_dict['partner'] = partner
        return package_dict

    def after_search(self, search_results, search_params):
        return search_results

    def read(self, entity):
        pass

    def create(self, entity):
        pass

    def edit(self, entity):
        pass

    def delete(self, entity):
        pass

    def after_create(self, context, pkg_dict):
        pass

    def after_update(self, context, pkg_dict):
        pass

    def after_delete(self, context, pkg_dict):
        pass

    def after_show(self, context, pkg_dict):
        pass
        # partner = toolkit.get_action('get_package_owner_details')(
        #         context,
        #         data_dict={'org_id': pkg_dict['owner_org']}
        # )
        # pkg_dict['partner'] = partner

    def before_index(self, pkg_dict):
        return pkg_dict

    # IRoute
    def after_map(self, map):
        map.connect('jhorg_members', '/jhorg/members/{id}',
                    controller='ckanext.justicehub_theme.controllers:JHOrgController',
                    action='members')
        map.connect('jhorg_stats', '/jhorg/stats/{id}',
                    controller='ckanext.justicehub_theme.controllers:JHOrgController',
                    action='org_stats')
        map.connect('jhsubscribe', '/subscribe',
                    controller='ckanext.justicehub_theme.controllers:SubscribeController',
                    action='subscribe')
        map.connect('jhupload', '/upload',
                    controller='ckanext.justicehub_theme.controllers:SubscribeController',
                    action='upload')
        map.connect('jhdataset', '/dataset',
                    controller='ckanext.justicehub_theme.controllers.dataset:PackageNewController',
                    action='search')
        map.connect('jhreaduser', '/user/show/{id}',
                    controller='ckanext.justicehub_theme.controllers.dataset:UserNewController',
                    action='read')


        return map
    
    def before_map(self, map):
        map.connect('jhupload', '/upload',
                    controller='ckanext.justicehub_theme.controllers:SubscribeController',
                    action='upload')
        map.connect('jhorg_members', '/organization/members/{id}',
                    controller='ckanext.justicehub_theme.controllers:JHOrgController',
                    action='members')
        map.connect('jhorg_stats', '/jhorg/stats/{id}',
                    controller='ckanext.justicehub_theme.controllers:JHOrgController',
                    action='org_stats')
        map.connect('jhsubscribe', '/subscribe',
                    controller='ckanext.justicehub_theme.controllers:SubscribeController',
                    action='subscribe')
        map.connect('jhdataset', '/dataset',
                    controller='ckanext.justicehub_theme.controllers.dataset:PackageNewController',
                    action='search')


        return map
