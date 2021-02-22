import logging
from flask import request, jsonify
from ckan.common import _, g, request

import ckan.logic as logic
import ckan.lib.helpers as h
import ckan.model as model
import ckan.plugins as p
import ckan.lib.base as base
from ckan.common import config, _, c, OrderedDict

from urllib import urlencode
from six import string_types, text_type
from paste.deploy.converters import asbool

from ckan.lib.plugins import lookup_package_plugin


NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
check_access = logic.check_access
get_action = logic.get_action
tuplize_dict = logic.tuplize_dict
clean_dict = logic.clean_dict
parse_params = logic.parse_params
flatten_to_string_key = logic.flatten_to_string_key
ValidationError = logic.ValidationError

log = logging.getLogger(__name__)
render = base.render
abort = base.abort


def _encode_params(params):
    return [(k, v.encode('utf-8') if isinstance(v, string_types) else str(v))
            for k, v in params]

def url_with_params(url, params):
    params = _encode_params(params)
    return url + u'?' + urlencode(params)


def search_url(params, package_type=None):
    if not package_type or package_type == 'dataset':
        url = h.url_for(controller='package', action='search')
    else:
        url = h.url_for('{0}_search'.format(package_type))
    return url_with_params(url, params)

class PackageNewController(base.BaseController):
    
    def _package_form(self, package_type=None):
        return lookup_package_plugin(package_type).package_form()

    def _setup_template_variables(self, context, data_dict, package_type=None):
        return lookup_package_plugin(package_type).\
            setup_template_variables(context, data_dict)

    def _new_template(self, package_type):
        return lookup_package_plugin(package_type).new_template()

    def _edit_template(self, package_type):
        return lookup_package_plugin(package_type).edit_template()

    def _search_template(self, package_type):
        return lookup_package_plugin(package_type).search_template()

    def _read_template(self, package_type):
        return lookup_package_plugin(package_type).read_template()

    def _history_template(self, package_type):
        return lookup_package_plugin(package_type).history_template()

    def _resource_form(self, package_type):
        # backwards compatibility with plugins not inheriting from
        # DefaultDatasetPlugin and not implmenting resource_form
        plugin = lookup_package_plugin(package_type)
        if hasattr(plugin, 'resource_form'):
            result = plugin.resource_form()
            if result is not None:
                return result
        return lookup_package_plugin().resource_form()

    def _resource_template(self, package_type):
        # backwards compatibility with plugins not inheriting from
        # DefaultDatasetPlugin and not implmenting resource_template
        plugin = lookup_package_plugin(package_type)
        if hasattr(plugin, 'resource_template'):
            result = plugin.resource_template()
            if result is not None:
                return result
        return lookup_package_plugin().resource_template()
    
    def _guess_package_type(self, expecting_name=False):
        """
            Guess the type of package from the URL handling the case
            where there is a prefix on the URL (such as /data/package)
        """

        # Special case: if the rot URL '/' has been redirected to the package
        # controller (e.g. by an IRoutes extension) then there's nothing to do
        # here.
        if request.path == '/':
            return 'dataset'

        parts = [x for x in request.path.split('/') if x]

        idx = -1
        if expecting_name:
            idx = -2

        pt = parts[idx]
        if pt == 'package':
            pt = 'dataset'

        return pt

    def search(self):
        from ckan.lib.search import SearchError, SearchQueryError

        package_type = self._guess_package_type()

        try:
            context = {'model': model, 'user': c.user,
                       'auth_user_obj': c.userobj}
            check_access('site_read', context)
        except NotAuthorized:
            abort(403, _('Not authorized to see this page'))

        # unicode format (decoded from utf8)
        q = c.q = request.params.get('q', u'')
        c.query_error = False
        page = h.get_page_number(request.params)

        limit = int(config.get('ckan.datasets_per_page', 20))

        # most search operations should reset the page counter:
        params_nopage = [(k, v) for k, v in request.params.items()
                         if k != 'page']

        def drill_down_url(alternative_url=None, **by):
            return h.add_url_param(alternative_url=alternative_url,
                                   controller='package', action='search',
                                   new_params=by)

        c.drill_down_url = drill_down_url

        def remove_field(key, value=None, replace=None):
            return h.remove_url_param(key, value=value, replace=replace,
                                      controller='package', action='search',
                                      alternative_url=package_type)

        c.remove_field = remove_field

        sort_by = request.params.get('sort', None)
        params_nosort = [(k, v) for k, v in params_nopage if k != 'sort']

        def _sort_by(fields):
            """
            Sort by the given list of fields.
            Each entry in the list is a 2-tuple: (fieldname, sort_order)
            eg - [('metadata_modified', 'desc'), ('name', 'asc')]
            If fields is empty, then the default ordering is used.
            """
            params = params_nosort[:]

            if fields:
                sort_string = ', '.join('%s %s' % f for f in fields)
                params.append(('sort', sort_string))
            return search_url(params, package_type)

        c.sort_by = _sort_by
        if not sort_by:
            c.sort_by_fields = []
        else:
            c.sort_by_fields = [field.split()[0]
                                for field in sort_by.split(',')]

        def pager_url(q=None, page=None):
            params = list(params_nopage)
            params.append(('page', page))
            return search_url(params, package_type)

        c.search_url_params = urlencode(_encode_params(params_nopage))

        try:
            c.fields = []
            # c.fields_grouped will contain a dict of params containing
            # a list of values eg {'tags':['tag1', 'tag2']}
            c.fields_grouped = {}
            search_extras = {}
            fq = ''
            for (param, value) in request.params.items():
                if param not in ['q', 'page', 'sort'] \
                        and len(value) and not param.startswith('_'):
                    if not param.startswith('ext_'):
                        c.fields.append((param, value))
                        fq += ' %s:"%s"' % (param, value)
                        if param not in c.fields_grouped:
                            c.fields_grouped[param] = [value]
                        else:
                            c.fields_grouped[param].append(value)
                    else:
                        search_extras[param] = value

            context = {'model': model, 'session': model.Session,
                       'user': c.user, 'for_view': True,
                       'auth_user_obj': c.userobj}

            # Unless changed via config options, don't show other dataset
            # types any search page. Potential alternatives are do show them
            # on the default search page (dataset) or on one other search page
            search_all_type = config.get(
                'ckan.search.show_all_types', 'dataset')
            search_all = False

            try:
                # If the "type" is set to True or False, convert to bool
                # and we know that no type was specified, so use traditional
                # behaviour of applying this only to dataset type
                search_all = asbool(search_all_type)
                search_all_type = 'dataset'
            # Otherwise we treat as a string representing a type
            except ValueError:
                search_all = True

            if not package_type:
                package_type = 'dataset'

            if not search_all or package_type != search_all_type:
                # Only show datasets of this particular type
                fq += ' +dataset_type:{type}'.format(type=package_type)

            facets = OrderedDict()

            default_facet_titles = {
                'organization': _('Organizations'),
                'groups': _('Groups'),
                'tags': _('Tags'),
                'res_format': _('Formats'),
                'license_id': _('Licenses'),
            }

            for facet in h.facets():
                if facet in default_facet_titles:
                    facets[facet] = default_facet_titles[facet]
                else:
                    facets[facet] = facet

            # Facet titles
            for plugin in p.PluginImplementations(p.IFacets):
                facets = plugin.dataset_facets(facets, package_type)

            c.facet_titles = facets

            data_dict = {
                'q': q,
                'fq': fq.strip(),
                'facet.field': facets.keys(),
                'rows': limit,
                'start': (page - 1) * limit,
                'sort': sort_by,
                'extras': search_extras,
                'include_private': asbool(config.get(
                    'ckan.search.default_include_private', True)),
            }

            query = get_action('package_search')(context, data_dict)
            c.sort_by_selected = query['sort']

            c.page = h.Page(
                collection=query['results'],
                page=page,
                url=pager_url,
                item_count=query['count'],
                items_per_page=limit
            )
            c.search_facets = query['search_facets']
            c.page.items = query['results']
        except SearchQueryError as se:
            # User's search parameters are invalid, in such a way that is not
            # achievable with the web interface, so return a proper error to
            # discourage spiders which are the main cause of this.
            log.info('Dataset search query rejected: %r', se.args)
            abort(400, _('Invalid search query: {error_message}')
                  .format(error_message=str(se)))
        except SearchError as se:
            # May be bad input from the user, but may also be more serious like
            # bad code causing a SOLR syntax error, or a problem connecting to
            # SOLR
            log.error('Dataset search error: %r', se.args)
            c.query_error = True
            c.search_facets = {}
            c.page = h.Page(collection=[])
        except NotAuthorized:
            abort(403, _('Not authorized to see this page'))

        c.search_facets_limits = {}
        for facet in c.search_facets.keys():
            try:
                limit = int(request.params.get('_%s_limit' % facet,
                                               int(config.get('search.facets.default', 10))))
            except ValueError:
                abort(400, _('Parameter "{parameter_name}" is not '
                             'an integer').format(
                    parameter_name='_%s_limit' % facet))
            c.search_facets_limits[facet] = limit

        self._setup_template_variables(context, {},
                                       package_type=package_type)

        return render(self._search_template(package_type),
                      extra_vars={'dataset_type': package_type})
