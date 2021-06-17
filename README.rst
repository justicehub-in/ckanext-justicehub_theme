.. You should enable this project on travis-ci.org and coveralls.io to make
   these badges work. The necessary Travis and Coverage config files have been
   generated for you.

.. image:: https://img.shields.io/badge/python-%202.7-44cc11.svg?style=flat-square
    :alt: Supported Python versions

.. image:: https://img.shields.io/badge/License-MIT-brightgreen.svg
    :target: https://opensource.org/licenses/MIT
    :alt: License

========================
ckanext-justicehub_theme
========================

CKAN Plugin custom theme for JusticeHub


------------
Requirements
------------

CKAN 2.8 or less, tested specifically with CKAN 2.8


------------
Installation
------------

.. Add any additional install steps to the list below.
   For example installing any non-Python dependencies or adding any required
   config settings.

To install ckanext-justicehub_theme:

1. Activate your CKAN virtual environment, for example::

     . /usr/lib/ckan/default/bin/activate

2. Install the ckanext-justicehub_theme by cloning this repository and then installing it by::

     python setup.py install

3. Add ``justicehub_theme`` to the ``ckan.plugins`` setting in your CKAN
   config file (by default the config file is located at
   ``/etc/ckan/default/production.ini``).

4. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu::

     sudo service apache2 reload


------------------------
Development Installation
------------------------

To install ckanext-justicehub_theme for development, activate your CKAN virtualenv and
do::

    git clone https://github.com/justicehub-in/ckanext-justicehub_theme.git
    cd ckanext-justicehub_theme
    python setup.py develop
    pip install -r dev-requirements.txt

