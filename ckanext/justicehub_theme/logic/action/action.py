from ckanext.issues.logic import schema

import ckan.lib.dictization.model_dictize as model_dictize
import ckan.model as model
import ckan.plugins as p
from ckan.logic import validate


import logging
import socket
import json

from paste.deploy.converters import asbool
from six import string_types, text_type

import ckan.logic as logic
import ckan.logic.schema
import ckan.plugins as plugins
import ckan.lib.search as search
import ckan.lib.plugins as lib_plugins

# TODO: Wrong way of doing
from ckan.logic.action.get import _add_tracking_summary_to_resource_dict, _get_or_bust
import ckan.authz as authz


_validate = ckan.lib.navl.dictization_functions.validate
NotFound = logic.NotFound
ValidationError = logic.ValidationError
_check_access = logic.check_access
get_action = logic.get_action

log = logging.getLogger('ckan.logic')


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

    # FIXME: commented becaues this validation causes solr to fail reindexing
    # group_plugin = lib_plugins.lookup_group_plugin(partner_dict['type'])
    # schema = logic.schema.default_show_group_schema()
    # partner, errors = lib_plugins.plugin_validate(
    #     group_plugin, context, partner_dict, schema, 'organization_show'
    # )
    for item in partner_dict['extras']:
        if item['state'] == 'active':
            partner_dict[item['key']] = item['value']

    partner_dict.pop('extras')
    return partner_dict


@p.toolkit.side_effect_free
def metadata_autocomplete(context, data_dict):
    session = context['session']
    field = data_dict['field']
    is_list = data_dict.get('islist', False)
    term = data_dict['incomplete']
    limit = data_dict.get('limit', 10)
    matching = []

    if term and isinstance(term, string_types) and is_list:
        results = session.execute(
            """
            select term
            from (
                select unnest(string_to_array(value, ',')) as term
                from package_extra where key='{field}'
            ) terms
            where term ilike '%{term}%'
            limit {limit};
            """.format(field=field, term=term, limit=limit)
        ).fetchall()
        if results:
            matching = [result for result in results[0]]

    elif term and isinstance(term, string_types):
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


@p.toolkit.side_effect_free
def package_show(context, data_dict):
    '''Return the metadata of a dataset (package) and its resources.

    :param id: the id or name of the dataset
    :type id: string
    :param use_default_schema: use default package schema instead of
        a custom schema defined with an IDatasetForm plugin (default: ``False``)
    :type use_default_schema: bool
    :param include_tracking: add tracking information to dataset and
        resources (default: ``False``)
    :type include_tracking: bool
    :rtype: dictionary

    '''
    print("NEW PACKAGE SHOW")
    model = context['model']
    context['session'] = model.Session
    name_or_id = data_dict.get("id") or _get_or_bust(data_dict, 'name_or_id')

    pkg = model.Package.get(name_or_id)

    if pkg is None:
        raise NotFound

    context['package'] = pkg

    _check_access('package_show', context, data_dict)

    if data_dict.get('use_default_schema', False):
        context['schema'] = ckan.logic.schema.default_show_package_schema()
    include_tracking = asbool(data_dict.get('include_tracking', False))

    package_dict = None
    use_cache = (context.get('use_cache', True)
                 and not 'revision_id' in context
                 and not 'revision_date' in context)
    if use_cache:
        try:
            search_result = search.show(name_or_id)
        except (search.SearchError, socket.error):
            pass
        else:
            use_validated_cache = 'schema' not in context
            if use_validated_cache and 'validated_data_dict' in search_result:
                package_json = search_result['validated_data_dict']
                package_dict = json.loads(package_json)
                package_dict_validated = True
            else:
                package_dict = json.loads(search_result['data_dict'])
                package_dict_validated = False
            metadata_modified = pkg.metadata_modified.isoformat()
            search_metadata_modified = search_result['metadata_modified']
            # solr stores less precice datetime,
            # truncate to 22 charactors to get good enough match
            if metadata_modified[:22] != search_metadata_modified[:22]:
                package_dict = None

    if not package_dict:
        package_dict = model_dictize.package_dictize(pkg, context)
        package_dict_validated = False

    if include_tracking:
        # page-view tracking summary data
        package_dict['tracking_summary'] = (
            model.TrackingSummary.get_for_package(package_dict['id']))

        for resource_dict in package_dict['resources']:
            _add_tracking_summary_to_resource_dict(resource_dict, model)

    if context.get('for_view'):
        for item in plugins.PluginImplementations(plugins.IPackageController):
            package_dict = item.before_view(package_dict)

    for item in plugins.PluginImplementations(plugins.IPackageController):
        item.read(pkg)

    for item in plugins.PluginImplementations(plugins.IResourceController):
        for resource_dict in package_dict['resources']:
            item.before_show(resource_dict)

    if not package_dict_validated:
        package_plugin = lib_plugins.lookup_package_plugin(
            package_dict['type'])
        if 'schema' in context:
            schema = context['schema']
        else:
            schema = package_plugin.show_package_schema()
        if schema and context.get('validate', True):
            package_dict, errors = lib_plugins.plugin_validate(
                package_plugin, context, package_dict, schema,
                'package_show')

    for item in plugins.PluginImplementations(plugins.IPackageController):
        item.after_show(context, package_dict)

    new_dict = {'id': package_dict['creator_user_id']}
    user_dict = get_action('user_show')(context, new_dict)
    package_dict['creator_name'] = user_dict.get('display_name')
    package_dict['creator_username'] = user_dict.get('name')
    package_dict['creator_email'] = user_dict.get('email')
    if (package_dict.get('extras')):
    	publisher_contact = next((sub for sub in package_dict['extras'] if sub['key'] == 'publisher_contacts'), None)
    	package_dict['publisher_name'] =  json.loads(publisher_contact.get('value'))[0].get('name') if publisher_contact else ""
    return package_dict


@p.toolkit.side_effect_free
def package_search(context, data_dict):
    # sometimes context['schema'] is None
    schema = (context.get('schema') or
              logic.schema.default_package_search_schema())
    data_dict, errors = _validate(data_dict, schema, context)
    # put the extras back into the data_dict so that the search can
    # report needless parameters
    data_dict.update(data_dict.get('__extras', {}))
    data_dict.pop('__extras', None)
    if errors:
        raise ValidationError(errors)

    model = context['model']
    session = context['session']
    user = context.get('user')

    _check_access('package_search', context, data_dict)

    # Move ext_ params to extras and remove them from the root of the search
    # params, so they don't cause and error
    data_dict['extras'] = data_dict.get('extras', {})
    for key in [key for key in data_dict.keys() if key.startswith('ext_')]:
        data_dict['extras'][key] = data_dict.pop(key)

    # check if some extension needs to modify the search params
    for item in plugins.PluginImplementations(plugins.IPackageController):
        data_dict = item.before_search(data_dict)

    # the extension may have decided that it is not necessary to perform
    # the query
    abort = data_dict.get('abort_search', False)

    if data_dict.get('sort') in (None, 'rank'):
        data_dict['sort'] = 'score desc, metadata_modified desc'

    results = []
    if not abort:
        if asbool(data_dict.get('use_default_schema')):
            data_source = 'data_dict'
        else:
            data_source = 'validated_data_dict'
        data_dict.pop('use_default_schema', None)

        result_fl = data_dict.get('fl')
        if not result_fl:
            data_dict['fl'] = 'id {0}'.format(data_source)
        else:
            data_dict['fl'] = ' '.join(result_fl)

        # Remove before these hit solr FIXME: whitelist instead
        include_private = asbool(data_dict.pop('include_private', False))
        include_drafts = asbool(data_dict.pop('include_drafts', False))
        data_dict.setdefault('fq', '')
        if not include_private:
            data_dict['fq'] = '({0}) AND {1}'.format(data_dict['fq'], 'capacity:public')   #'capacity:public +' + data_dict['fq']
        if include_drafts:
            data_dict['fq'] += ' +state:(active OR draft)'

        # Pop these ones as Solr does not need them
        extras = data_dict.pop('extras', None)

        # enforce permission filter based on user
        if context.get('ignore_auth') or (user and authz.is_sysadmin(user)):
            labels = None
        else:
            labels = lib_plugins.get_permission_labels(
            ).get_user_dataset_labels(context['auth_user_obj'])

        query = search.query_for(model.Package)
        state_query = ' +state:(draft OR pending-review OR under-review OR resubmission-required OR rejected OR active)'
        if data_dict['fq']:
            data_dict['fq'] = '({0}) AND {1}'.format(data_dict['fq'], state_query)
        else:
            data_dict['fq'] = state_query
        query.run(data_dict, permission_labels=labels)

        # Add them back so extensions can use them on after_search
        data_dict['extras'] = extras

        if result_fl:
            for package in query.results:
                if isinstance(package, text_type):
                    package = {result_fl[0]: package}
                if package.get('extras'):
                    package.update(package['extras'] )
                    package.pop('extras')
                results.append(package)
        else:
            for package in query.results:
                # get the package object
                package_dict = package.get(data_source)
                ## use data in search index if there
                if package_dict:
                    # the package_dict still needs translating when being viewed
                    package_dict = json.loads(package_dict)
                    if context.get('for_view'):
                        for item in plugins.PluginImplementations(
                                plugins.IPackageController):
                            package_dict = item.before_view(package_dict)
                    results.append(package_dict)
                else:
                    log.error('No package_dict is coming from solr for package '
                              'id %s', package['id'])

        count = query.count
        facets = query.facets
    else:
        count = 0
        facets = {}
        results = []

    search_results = {
        'count': count,
        'facets': facets,
        'results': results,
        'sort': data_dict['sort']
    }

    # create a lookup table of group name to title for all the groups and
    # organizations in the current search's facets.
    group_names = []
    for field_name in ('groups', 'organization'):
        group_names.extend(facets.get(field_name, {}).keys())

    groups = (session.query(model.Group.name, model.Group.title)
              .filter(model.Group.name.in_(group_names))
              .all()
              if group_names else [])
    group_titles_by_name = dict(groups)

    # Transform facets into a more useful data structure.
    restructured_facets = {}
    for key, value in facets.items():
        restructured_facets[key] = {
            'title': key,
            'items': []
        }
        for key_, value_ in value.items():
            new_facet_dict = {}
            new_facet_dict['name'] = key_
            if key in ('groups', 'organization'):
                display_name = group_titles_by_name.get(key_, key_)
                display_name = display_name if display_name and display_name.strip() else key_
                new_facet_dict['display_name'] = display_name
            elif key == 'license_id':
                license = model.Package.get_license_register().get(key_)
                if license:
                    new_facet_dict['display_name'] = license.title
                else:
                    new_facet_dict['display_name'] = key_
            else:
                new_facet_dict['display_name'] = key_
            new_facet_dict['count'] = value_
            restructured_facets[key]['items'].append(new_facet_dict)
    search_results['search_facets'] = restructured_facets

    # check if some extension needs to modify the search results
    for item in plugins.PluginImplementations(plugins.IPackageController):
        search_results = item.after_search(search_results, data_dict)

    # After extensions have had a chance to modify the facets, sort them by
    # display name.
    for facet in search_results['search_facets']:
        search_results['search_facets'][facet]['items'] = sorted(
            search_results['search_facets'][facet]['items'],
            key=lambda facet: facet['display_name'], reverse=True)

    #TODO: move this inside query isntead of adding separately
    for package in search_results['results']:
	    new_dict = {'id': package['creator_user_id']}
	    user_dict = get_action('user_show')(context, new_dict)
	    package['creator_name'] = user_dict.get('display_name')
	    package['creator_username'] = user_dict.get('name')
	    package['creator_email'] = user_dict.get('email')

    return search_results
