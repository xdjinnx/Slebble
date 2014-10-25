from bottle import Bottle, request
import urllib2
import json

bottle = Bottle()


@bottle.route('/', method='GET')
def index():
    key = 'UacUcP0MlG9fZ0j82r1k5he6KXQ6koSS'
    fromm = request.GET.get('from', '').strip()
    url = 'https://api.trafiklab.se/samtrafiken/resrobot/FindLocation.json'
    url = url + '?key=' + key + '&from=' + urllib2.quote(fromm) + '&coordSys=RT90&apiVersion=2.1'
    req = urllib2.Request(url)
    response = urllib2.urlopen(req)
    the_page = response.read()
    return json.loads(the_page)
    


# Define an handler for 404 errors.
@bottle.error(404)
def error_404(error):
    return 'Sorry, nothing at this URL.'