from bottle import Bottle
import urllib2
from json import loads, JSONEncoder
from google.appengine.api import memcache

bottle = Bottle()


@bottle.get('/resrobot/<query>')
def resrobot(query):
    json = memcache.get('resrobot_'+query)
    if json is None:
        key = '77697c18-628a-49ec-a6de-c194ca16cbcb'
        url = 'https://api.resrobot.se/location.name.json'
        url += '?key=' + key + '&input=' + urllib2.quote(query)
        print url
        response = urllib2.urlopen(url)
        the_page = response.read()
        jsondata = loads(the_page)

        stations = jsondata['StopLocation']

        data = []
        for s in stations:
            stat = {}
            stat['id'] = s['id']
            stat['name'] = s['name']
            data.append(stat)

        json = loads('{"result":'+JSONEncoder().encode(data)+'}')
        memcache.add('resrobot_'+query, json)
    return json


@bottle.get('/sl/<query>')
def sl(query):
    json = memcache.get('sl_'+query)
    if json is None:
        key = '6c0aa9d734fd42398f13ef4a4d6075de'
        url = 'http://api.sl.se/api2/typeahead.json'
        url += '?key=' + key + '&searchstring=' + urllib2.quote(query) + '&stationsonly=True&maxresults=25'
        print url
        result = urllib2.urlopen(url)
        the_page = result.read()
        jsondata = loads(the_page)

        stations = jsondata['ResponseData']
        data = []
        for s in stations:
            stat = {}
            stat['id'] = s['SiteId']
            stat['name'] = s['Name']
            data.append(stat)

        json = loads('{"result":'+JSONEncoder().encode(data)+'}')
        memcache.add('sl_'+query, json)
    return json


# Define an handler for 404 errors.
@bottle.error(404)
def error_404(error):
    return 'Sorry, nothing at this URL.'
