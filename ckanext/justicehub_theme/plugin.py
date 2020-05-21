import json

from sqlalchemy import MetaData
from sqlalchemy.sql import select

import ckan.logic as logic
import ckan.model as model
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import c

cached_tables = {}


def package_activity_stream(id):
    context = {'model': model, 'session': model.Session,
               'user': c.user, 'for_view': True,
               'auth_user_obj': c.userobj}
    package_activity_stream = logic.get_action('package_activity_list_html')(context, {'id': id})
    return package_activity_stream

def get_table(name):
    if name not in cached_tables:
        meta = MetaData()
        meta.reflect(bind=model.meta.engine)
        table = meta.tables[name]
        cached_tables[name] = table
    return cached_tables[name]

def get_resource_downloads(resource):
    connection = model.Session.connection()
    resource_stats = get_table('resource_stats')
    s = select([resource_stats.c.resource_id,
                resource_stats.c.visits_recently,
                resource_stats.c.visits_ever]
        ).where(resource_stats.c.resource_id == resource['id'])
    res = connection.execute(s).fetchone()
    if res:
        return {'total' : res.visits_ever,
                'recent': res.visits_recently}

    return {'total': 0, 'recent': 0}

def get_package_avg_downloads(pkg):
    '''
    Returns the average of total downloads of all the resources of a package.
    '''
    total_downloads = 0
    avg_downloads = 0

    if not pkg['resources']:
        return avg_downloads

    for resource in pkg['resources']:
        if isinstance(resource['downloads'], unicode):
            resource['downloads'] = json.loads(resource['downloads'].replace("'", '"'))

        total_downloads += resource['downloads']['total']

    avg_downloads = total_downloads / float(len(pkg['resources']))
    return int(avg_downloads)


class Justicehub_ThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IPackageController)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'justicehub_theme')

    def get_helpers(self):
        '''
        Register helper functions.
        '''
        # Template helper function names should begin with the name of the
        # extension they belong to, to avoid clashing with functions from
        # other extensions.
        return {
                'justicehub_theme_get_package_avg_downloads': get_package_avg_downloads,
                'justicehub_theme_package_activity_stream': package_activity_stream
                }

    def before_search(self, search_params):
        u'''Extensions will receive a dictionary with the query parameters,
        and should return a modified (or not) version of it.
        '''
        return search_params

    def before_view(self, package_dict):
        u'''Extensions will receive a dictionary with the query parameters,
        and should return a modified (or not) version of it.
        '''
        for resource_dict in package_dict['resources']:
            resource_dict['downloads'] = get_resource_downloads(resource_dict)

        package_dict['tracking_summary'] = (
            model.TrackingSummary.get_for_package(package_dict['id']))

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

    def before_index(self, pkg_dict):
        return pkg_dict
