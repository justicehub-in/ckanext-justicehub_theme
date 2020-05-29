import json

import requests

import ckanext.justicehub_theme.logic.action as jh_action
from sqlalchemy import MetaData
from sqlalchemy.sql import select

import ckan.logic as logic
import ckan.lib.base as base
import ckan.model as model
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import c,request
import ckan.lib.navl.dictization_functions as dict_fns

from pylons import config

import ckan.controllers.organization as org

cached_tables = {}
clean_dict = logic.clean_dict
parse_params = logic.parse_params
tuplize_dict = logic.tuplize_dict

def parse_json(string):
    return json.loads(string)

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

def get_package_visits(pkg):
    '''
    Returns the number of times the package is accessed
    '''
    connection = model.Session.connection()
    total = 0
    recent = 0
    tracking_summary = get_table('tracking_summary')
    s = select([tracking_summary.c.package_id,
                tracking_summary.c.recent_views,
                tracking_summary.c.running_total]
        ).where(tracking_summary.c.package_id == pkg['id'])
    res = connection.execute(s).fetchone()
    if res:
        total = res.running_total
        recent = res.recent_views
    return {'total' : total,
            'recent': recent}

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
                'justicehub_theme_get_package_avg_downloads': get_package_avg_downloads,
                'justicehub_theme_package_activity_stream': package_activity_stream,
                'justicehub_theme_parse_json': parse_json
                }

    #IActions
    def get_actions(self):
        return dict((name, function) for name, function
                    in jh_action.__dict__.items()
                    if callable(function))


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
        for resource_dict in package_dict['resources']:
            resource_dict['downloads'] = get_resource_downloads(resource_dict)

        package_dict['tracking_summary'] = (
            model.TrackingSummary.get_for_package(package_dict['id']))

        context = {'model': model, 'session': model.Session,
                   'user': c.user, 'for_view': True,
                   'auth_user_obj': c.userobj}
        partner = toolkit.get_action('get_package_owner_details')(
                context,
                data_dict={'org_id': package_dict['owner_org']}
        )
        package_dict['partner'] = partner
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

    # IRoute
    def after_map(self, map):
        map.connect('jhorg_members', '/jhorg/members/{id}',
                    controller='ckanext.justicehub_theme.plugin:JHOrgController',
                    action='members')
        map.connect('jhorg_stats', '/jhorg/stats/{id}',
                    controller='ckanext.justicehub_theme.plugin:JHOrgController',
                    action='org_stats')
        map.connect('jhsubscribe', '/subscribe',
                    controller='ckanext.justicehub_theme.plugin:SubscribeController',
                    action='subscribe')
        return map
    
    def before_map(self, map):
        map.connect('jhorg_members', '/organization/members/{id}',
                    controller='ckanext.justicehub_theme.plugin:JHOrgController',
                    action='members')
        map.connect('jhorg_stats', '/jhorg/stats/{id}',
                    controller='ckanext.justicehub_theme.plugin:JHOrgController',
                    action='org_stats')
        map.connect('jhsubscribe', '/subscribe',
                    controller='ckanext.justicehub_theme.plugin:SubscribeController',
                    action='subscribe')
        return map


class JHOrgController(org.OrganizationController):
    def members(self, id):
        '''
        Modified core method from 'group' controller.
        Enable view for non signed in user.

        :param id: id of the organization for which the member list is requested
        :type id: string
        :return: the rendered template
        :rtype: unicode
        '''
        group_type = self._ensure_controller_matches_group_type(id)

        context = {'model': model, 'session': model.Session,
                   'user': c.user}

        data_dict = {'id': id}
        try:
            c.members = self._action('member_list')(
                context, {'id': id, 'object_type': 'user'}
            )
            data_dict['include_datasets'] = False
            c.group_dict = self._action('group_show')(context, data_dict)
        except NotFound:
            abort(404, _('Oraganization not found'))

        return self._render_template('organization/jh_members.html', group_type)

    def org_stats(self, id):
        group_type = self._ensure_controller_matches_group_type(id)

        context = {'model': model, 'session': model.Session,
                   'user': c.user,
                   'schema': self._db_to_form_schema(group_type=group_type),
                   'for_view': True}
        data_dict = {'id': id, 'type': group_type}
        # unicode format (decoded from utf8)
        c.q = ''

        try:
            data_dict['include_datasets'] = True
            c.group_dict = self._action('group_show')(context, data_dict)
            c.group = context['group']
        except NotFound:
            abort(404, _('Organization not found'))
        self._read(id, 999, group_type)
        downloads = 0
        visits = 0
        for package in c.page.items:
            downloads += get_package_avg_downloads(package)
            visits += get_package_visits(package)['total']
        c.group_dict.update({'downloads':downloads, 'visits': visits})
        return plugins.toolkit.render('organization/stats.html', extra_vars={'group_type': group_type, 'downloads': downloads})

class SubscribeController(base.BaseController):
    def subscribe(self):
        basic_auth_key = config.get("mailchimp_api_key", "")
        subscriber_list_id = config.get("mailchimp_list_id", "")
        subscriber_tag_id = config.get("mailchimp_tag_id", "")
        mailchimp_base_url = config.get("mailchimp_base_url", "")
        url = mailchimp_base_url + subscriber_list_id + "/members"

        request_body = clean_dict(dict_fns.unflatten(
                    tuplize_dict(parse_params(request.params))))

        payload = {
            "email_address": str(request_body.get("email", "")),
            "status": "subscribed"
            }
        headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic '+ basic_auth_key
        }

        response = requests.request("POST", url, headers=headers, data = json.dumps(payload))

        print(response.text.encode('utf8'))

        tag_url = mailchimp_base_url + subscriber_list_id + "/segments/" + subscriber_tag_id + "/members"

        payload = {
            "email_address": str(request_body.get("email", ""))
            }

        response = requests.request("POST", tag_url, headers=headers, data = json.dumps(payload))

        print response.text.encode('utf8')