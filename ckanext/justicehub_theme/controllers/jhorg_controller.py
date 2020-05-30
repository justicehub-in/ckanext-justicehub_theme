
import ckan.controllers.organization as org
import ckan.model as model
from ckan.common import c

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
            abort(404, _('Group not found'))

        return self._render_template('group/members.html', group_type)