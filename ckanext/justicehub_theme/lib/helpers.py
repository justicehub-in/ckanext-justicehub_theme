import json
from datetime import datetime

from ckanext.issues.controller.controller import issues_for_dataset
from dateutil.parser import parse as parse_dates
from sqlalchemy import MetaData
from sqlalchemy.sql import select

import ckan.logic as logic
import ckan.model as model
from ckan.common import c

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
