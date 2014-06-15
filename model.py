import logging
import time
import json
from datetime import datetime

from google.appengine.ext import ndb
from google.appengine.api import memcache

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
    def fetch_all(cls):
        result = memcache.get('[MatchAll]');
        if result is None:
            result = cls.query().order(cls.date).fetch()
            memcache.set('[MatchAll]', result)
        return result

    @classmethod
    def fetch_by_id(cls, match_id):
        result = memcache.get('[MatchId]'+str(match_id))
        if result is None:
            result = cls.query(cls.matchid==int(match_id)).fetch(1)[0]
            memcache.set('[MatchId]'+str(match_id), result)
        return result

    @classmethod
    def fetch_by_stage(cls, stage_name):
        result = memcache.get('[StageName]'+stage_name);
        if result is None:
            result = cls.query(cls.stage==stage_name).order(cls.date).fetch()
            memcache.set('[StageName]'+stage_name, result)
        return result

    @classmethod
    def fetch_by_name(cls, team_name):
        result = memcache.get('[TeamName]'+team_name);
        if result is None:
            result = cls.query(ndb.OR(cls.team_a==team_name, cls.team_b==team_name)).fetch()
            memcache.set('[TeamName]'+team_name, result)
        return result

    def _post_put_hook(self, future):
        match = future.get_result().get()
        memcache.delete_multi([
            '[MatchAll]',
            '[BestBet]True',
            '[BestBet]False',
            '[MatchId]'+str(match.matchid),
            '[StageName]'+match.stage,
            '[TeamName]'+match.team_a,
            '[TeamName]'+match.team_b
            ]);

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

    @classmethod
    def fetch_all(cls):
        result = memcache.get('[BetAll]');
        if result is None:
            result = cls.query().fetch()
            memcache.set('[BetAll]', result)
        return result

    @classmethod
    def fetch_by_matchid(cls, match_id):
        result = memcache.get('[BetMatchid]'+str(match_id));
        if result is None:
            result = cls.query(cls.bet_match_id==int(match_id)).fetch()
            memcache.set('[BetMatchid]'+str(match_id), result)
        return result

    @classmethod
    def fetch_by_userid(cls, user_id):
        result = memcache.get('[BetUserId]'+user_id);
        if result is None:
            result = cls.query(cls.userid==user_id).fetch()
            memcache.set('[BetUserId]'+user_id, result)
        return result

    @classmethod
    def fetch_by_matchid_userid(cls, match_id, user_id):
        result = memcache.get('[BetMatchIdUserId]'+str(match_id)+':'+user_id);
        if result is None:
            result = cls.query(ndb.AND(cls.userid==user_id, cls.bet_match_id==int(match_id))).fetch()
            memcache.set('[BetMatchIdUserId]'+str(match_id)+':'+user_id, result)
        return result

    def _post_put_hook(self, future):
        bet = future.get_result().get()
        memcache.delete_multi([
            '[BetAll]',
            '[BestBet]True',
            '[BestBet]False',
            '[BetMatchid]'+str(bet.bet_match_id),
            '[BetUserId]'+bet.userid,
            '[BetMatchIdUserId]'+str(bet.bet_match_id)+':'+bet.userid
            ]);
