import json
from datetime import datetime

from ckanext.issues.controller.controller import issues_for_dataset
from dateutil.parser import parse as parse_dates
from sqlalchemy import MetaData
from sqlalchemy.sql import select

import ckan.lib.dictization.model_dictize as model_dictize

import ckan.logic as logic
import ckan.model as model
from ckan.common import c
from six import string_types, text_type
from webhelpers.html import tags
import ckan.lib.helpers as h

cached_tables = {}

def is_org_admin(username, org):
    for user in org['users']:
        if user['name'] == username and user['capacity'] == 'admin':
            return True

def issues_vars(dataset_id, request):
    extra_vars = issues_for_dataset(dataset_id, request.GET)
    return extra_vars

def get_assignee_user(user_id):
    '''
    return user object for a user id.
    '''
    context = {'model': model, 'session': model.Session,
               'user': c.user, 'for_view': True,
               'auth_user_obj': c.userobj}
    user = model.Session.query(model.User)\
            .filter(model.User.id == user_id)\
            .distinct()\
            .first()
    return user


def parse_json(string):
    return json.loads(string)


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
    return {'total' : total, 'recent': recent}



def get_popular_groups():

    context = {}
    data_dict = {'sort': 'package_count desc',
		'all_fields': True,
                'include_dataset_count': True}

    groups =  logic.get_action('group_list')(context, data_dict)
    return groups[0:12]


    #context = {'model': model}
    
    #TODO: short the groups by number of datasets in it
    #q = model.Session.query(model.Group) \
    #    .filter(model.Group.is_organization == False) \
    #    .filter(model.Group.state == 'active') \
    #    .limit(12)


    #groups = q.all()

    #group_list = model_dictize.group_list_dictize(groups, context)
    #return group_list


def pop_zip_resource(pkg):
    '''Finds the zip resource in a package's resources, removes it from the
    package and returns it. NB the package doesn't have the zip resource in it
    any more.
    '''
    zip_res = None
    non_zip_resources = []
    for res in pkg.get('resources', []):
        if res.get('downloadall_metadata_modified'):
            zip_res = res
        else:
            non_zip_resources.append(res)
    pkg['resources'] = non_zip_resources
    return zip_res



def show_linked_user(user, maxlength=0, avatar=20):
    if not isinstance(user, model.User):
        user_name = text_type(user)
        user = model.User.get(user_name)
        if not user:
            return user_name
    if user:
        name = user.name if model.User.VALID_NAME.match(user.name) else user.id
        displayname = user.display_name

        if maxlength and len(user.display_name) > maxlength:
            displayname = displayname[:maxlength] + '...'

        return tags.literal(u'{icon} {link}'.format(
            icon=h.gravatar(
                email_hash=user.email_hash,
                size=avatar
            ),
            link=tags.link_to(
                displayname,
                ('/user/show/' + name)
            )
        ))


