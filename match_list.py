import logging
import json
import time
from datetime import datetime

from flask import Flask,make_response,redirect,url_for,request

from google.appengine.ext import ndb
from google.appengine.api import users

from model import Match,DateTimeEncoder

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/list')
@app.route('/list/<stage_name>')
def list_matches(stage_name=None):
    """Return a list of match according to the stage name"""
    matches = []
    if stage_name != None:
            matches.append([match.to_dict() for match in Match.query(Match.stage==stage_name).fetch()])
    else:
        match_stages=Match.query(projection=[Match.stage],distinct=True).fetch()
        for match_stage in match_stages:
            matches.append([match.to_dict() for match in Match.query(Match.stage==match_stage.stage).fetch()])
    response = make_response(json.dumps(matches, cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    return response