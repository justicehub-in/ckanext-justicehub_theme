from ckanext.issues.logic import schema
from six import string_types

import ckan.lib.dictization.model_dictize as model_dictize
import ckan.lib.plugins as lib_plugins
import ckan.logic as logic
import ckan.model as model
import ckan.plugins as p
from ckan.logic import validate

try:
    import ckan.authz as authz
except ImportError:
    import ckan.new_authz as authz


@p.toolkit.side_effect_free
@validate(schema.organization_users_autocomplete_schema)
def partner_users_autocomplete(context, data_dict):
    session = context['session']
    user = context['user']
    q = data_dict['q']
    organization_id = data_dict['organization_id']
    limit = data_dict.get('limit', 20)
    query = session.query(model.User.id, model.User.name,
                          model.User.fullname)\
        .filter(model.Member.group_id == organization_id)\
        .filter(model.Member.table_name == 'user')\
        .filter(model.Member.capacity.in_(['editor', 'admin']))\
        .filter(model.Member.state == 'active')\
        .filter(model.User.state != model.State.DELETED)\
        .filter(model.User.id == model.Member.table_id)\
        .filter(model.User.name.ilike('{0}%'.format(q)))\
        .distinct()\
        .limit(limit)

    users = []
    for user in query.all():
        users.append(user)
    return users

@p.toolkit.side_effect_free
def get_package_owner_details(context, data_dict):
    session = context['session']
    org_id = data_dict['org_id']
    partner = session.query(model.Group).filter(model.Group.id == org_id).first()
    partner_dict = model_dictize.group_dictize(partner, context,
                                               packages_field='dataset_count',
                                               include_extras=True
                                               )



@p.toolkit.side_effect_free
def metadata_autocomplete(context, data_dict):
    session = context['session']
    field = data_dict['field']
    term = data_dict['incomplete']
    limit = data_dict.get('limit', 10)
    matching = []

    if term and isinstance(term, string_types):
        q = model.Session.query(model.PackageExtra)
        results = q.filter(model.PackageExtra.key == field)\
                .filter(model.PackageExtra.value.ilike('{0}%'.format(term)))\
                .distinct()\
                .limit(limit)
        matching = [result.value for result in results]

    return matching

@p.toolkit.side_effect_free
def resource_metadata_autocomplete(context, data_dict):
    session = context['session']
    field = data_dict['field']
    term = data_dict['incomplete']
    limit = data_dict.get('limit', 10)
    matching = []

    if term and isinstance(term, string_types):
        results = session.execute("""select extras::json->>'{field}'
                                  from resource
                                  where extras::json->>'{field}' ilike '{term}%'
                                  limit {limit};""".format(field=field, term=term, limit=limit)
                                  ).fetchall()
        matching = [result[0] for result in results]

    return matching
