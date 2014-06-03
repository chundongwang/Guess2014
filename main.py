import logging
import json

from flask import Flask,request,render_template,send_from_directory,redirect,url_for

from google.appengine.ext import ndb
from google.appengine.api import users

from model import Match

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    user = users.get_current_user()
    login_url = None
    user_nickname = None
    if not user:
        login_url = create_login_url(url_for('/'))
    else:
        user_nickname = user.nickname()
        
    match_stages=Match.query(projection=[Match.stage],distinct=True).fetch()
    matches = []
    for match_stage in match_stages:
        matches.append(Match.query(Match.stage==match_stage.stage).fetch())
    return render_template('index.html', matches=matches, user_nickname=user_nickname, login_url=login_url)

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, nothing at this URL.', 404

if __name__ == '__main__':
    app.run()