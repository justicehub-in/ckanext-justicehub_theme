import json

import requests
from ckanext.justicehub_theme.lib import helpers
from pylons import config

import ckan.controllers.organization as org
import ckan.lib.base as base
import ckan.lib.navl.dictization_functions as dict_fns
import ckan.lib.plugins as plugins
import ckan.logic as logic
import ckan.model as model
from ckan.common import c, request
import ckan.lib.helpers as h

clean_dict = logic.clean_dict
parse_params = logic.parse_params
tuplize_dict = logic.tuplize_dict


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
            downloads += helpers.get_package_avg_downloads(package)
            visits += helpers.get_package_visits(package)['total']
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

        tag_url = mailchimp_base_url + subscriber_list_id + "/segments/" + subscriber_tag_id + "/members"

        payload = {
            "email_address": str(request_body.get("email", ""))
        }

        tag_response = requests.request("POST", tag_url, headers=headers, data = json.dumps(payload))

        return response.text.encode('utf8')

    def upload(self):
        if c.user:
            return plugins.toolkit.render('dataupload/index.html')
        else:
            #TO DO: change hardcoded value "/upload" to directly pick from requester url
            h.redirect_to('/login?came_from=/upload')
