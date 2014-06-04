import time
import json
from datetime import datetime

from google.appengine.ext import ndb

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            encoded_object = int(time.mktime(obj.timetuple())*1000)
        else:
            encoded_object = json.JSONEncoder.default(self, obj)
        return encoded_object

class Match(ndb.Model):
    """Individual match"""
    matchid = ndb.IntegerProperty()
    date = ndb.DateTimeProperty()
    stage = ndb.StringProperty()
    team_a = ndb.StringProperty()
    team_b = ndb.StringProperty()
    score_a = ndb.IntegerProperty()
    score_b = ndb.IntegerProperty()
    extra_a = ndb.IntegerProperty()
    extra_b = ndb.IntegerProperty()
    penalty_a = ndb.IntegerProperty()
    penalty_b = ndb.IntegerProperty()

    @classmethod
    def query_all(cls):
        return Match.query().order(Match.stage)

class Bet(ndb.Model):
    """People's bet"""
    userid = ndb.StringProperty()
    useremail = ndb.StringProperty()
    bet_match_id = ndb.IntegerProperty()
    score_a = ndb.IntegerProperty()
    score_b = ndb.IntegerProperty()
    extra_a = ndb.IntegerProperty()
    extra_b = ndb.IntegerProperty()
    penalty_a = ndb.IntegerProperty()
    penalty_b = ndb.IntegerProperty()
    bet_amount = ndb.IntegerProperty()
