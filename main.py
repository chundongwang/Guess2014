import logging
import json
import os

from datetime import date,datetime,timedelta
import time

from flask import Flask,request,render_template,send_from_directory,redirect,url_for,abort,Response,make_response,Markup

from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.api import memcache

from model import Match,Bet,DateTimeEncoder

def isLocal():
    return os.environ['SERVER_SOFTWARE'].startswith('Development')

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

def json_response(obj):
    response = make_response(json.dumps(obj, cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    return response

known_users={
    "yangyilincn@gmail.com":"Yilin Yang",
    "nanruqin@gmail.com":"Carl Nan",
    "zhanbo.xiong@gmail.com":"Ray Xiong",
    "dbfuns@gmail.com":"Edward Liu",
    "lss672@gmail.com":"Shanshan Liu",
    "kenthzhang@gmail.com":"Jason Zhang",
    "knightlinwu@gmail.com":"Wu Lin",
    "yunwu55@gmail.com":"Yunlong Wu",
    "dotnetview@gmail.com":"Lei Ma",
    "dengydongn@gmail.com":"Chandler Deng",
    "zhaoyong73@gmail.com":"Yong Zhao",
    "cnjamescao@gmail.com":"James Cao",
    "lfive.wujun@gmail.com":"Wujun Li",
    "TheQuanSheng@gmail.com":"Quan Sheng",
    "samprasyork@gmail.com":"Shawn Yu",
    "lilylihou@gmail.com":"Lily Hou",
    "chundongwang@gmail.com":"Chundong Wang"
}

@app.route('/')
def main():
    user = users.get_current_user()
    login_url = None
    user_nickname = None
    if not user:
        # call Markup or we'll end up with escaped url
        login_url = Markup(users.create_login_url(url_for('main')))
    else:
        user_nickname = user.nickname()
    #index.html is for prod, index2.html for local development
    template = 'index.html'
    if isLocal():
        template = 'index2.html'
    logging.info('%s just visited' % str(user_nickname))
    admin_status = str(users.is_current_user_admin())
    return render_template(template, user_nickname=user_nickname, login_url=login_url, admin_status=admin_status)

@app.route('/list')
@app.route('/list/<stage_name>')
def list_matches(stage_name=None):
    """Return a list of match according to the stage name"""
    matches = []
    if stage_name is not None:
        matches_of_this_stage = [match.to_dict() for match in Match.fetch_by_stage(match_stage)]
        matches_of_this_stage.sort(key=lambda match: match['date'])
        matches.append(matches_of_this_stage)
    else:
        group_stages=['Group '+g for g in ['A','B','C','D','E','F','G','H']]
        knockoff_stages=['Round of 16','Quarterfinals','Semi-Finals','Third-Place Play-Off','Final']
        for match_stage in group_stages:
            matches_of_this_stage = [match.to_dict() for match in Match.fetch_by_stage(match_stage)]
            matches_of_this_stage.sort(key=lambda match: match['date'])
            matches.append(matches_of_this_stage)
        for match_stage in knockoff_stages:
            matches_of_this_stage = [match.to_dict() for match in Match.fetch_by_stage(match_stage)]
            matches_of_this_stage.sort(key=lambda match: match['date'])
            matches.append(matches_of_this_stage)
    return json_response(matches)

def calcPopularity(team_name=None):
    if team_name is None:
        abort(400)
    support = memcache.get('[TeamPop]'+team_name)
    if support is None:
        matches = Match.fetch_by_name(team_name)
        support=0
        for match in matches:
            bets = Bet.query(Bet.bet_match_id==int(match.matchid)).fetch()
            for bet in bets:
                if match.team_a == team_name and bet.score_a > bet.score_b:
                    support+=1
                elif match.team_b == team_name and bet.score_b > bet.score_a:
                    support+=1
        # expire in 5 minutes
        memcache.set('[TeamPop]'+team_name, support, 300)
    return support
        
@app.route('/pop/<match_id>')
def popularity(match_id=None):
    if match_id is None:
        abort(400)
    match = Match.fetch_by_id(match_id)
    final_result = {
        "team_a":calcPopularity(match.team_a),
        "team_b":calcPopularity(match.team_b),
        "match":match.to_dict()
    }
    return json_response(final_result)

@app.route('/report/<match_id>')
def report_match(match_id=None):
    user = users.get_current_user()
    if match_id is None or not user:
        abort(401)
    bets = Bet.query(Bet.bet_match_id==int(match_id)).fetch()
    match = Match.fetch_by_id(match_id)

    # No report page until 10 minutes prior to the beginning of the match
    if datetime.utcnow()+timedelta(minutes=10) <= match.date:
        abort(400)

    show_known_user = False
    if user.email() in known_users:
        show_known_user = True
    bet_results = []
    for bet in bets:
        result = bet.to_dict()
        if show_known_user and result['useremail'] in known_users:
            result['useremail'] = known_users[result['useremail']]
        result['match'] = match.to_dict()
        bet_results.append(result)
    return json_response(bet_results)

@app.route('/list_by_date')
def list_matches_by_date():
    """Return a list of match list group by date"""
    matches_by_date = {}
    for match in Match.fetch_all():
        d = date.fromtimestamp(time.mktime(match.date.timetuple()))
        if not d in matches_by_date:
            matches_by_date[d] = []
        matches_by_date[d].append(match.to_dict())
    return json_response(sorted(matches_by_date.values(), key=lambda list: list[0]['date']))

@app.route('/bet/<match_id>')
@app.route('/bet/<match_id>/<bet_amount>')
def bet(match_id, bet_amount=1):
    """Put down a bet"""
    user = users.get_current_user()
    if not user:
        abort(401)
        #return redirect(users.create_login_url(url_for('main')))
    else:
        match = Match.fetch_by_id(match_id)

        # Shutdown bet channel 10 minutes prior to the beginning of the match
        if datetime.utcnow()+timedelta(minutes=10) > match.date:
            abort(400)

        logging.info('betting on %s' % str(match))
        # Don't bet on played matches
        if match.score_a is not None or match.score_b is not None:
            abort(400)
        bets = Bet.query(ndb.AND(Bet.userid==user.user_id(), Bet.bet_match_id==int(match_id))).fetch()
        result = {}
        score_a = request.args.get('sa',None)
        score_b = request.args.get('sb',None)
        extra_a = request.args.get('ea',None)
        extra_b = request.args.get('eb',None)
        penalty_a = request.args.get('pa',None)
        penalty_b = request.args.get('pb',None)

        #Sanity check
        #score_a and score_b are mandtary.
        if score_a is None or score_b is None:
            abort(400)
        else:
            #extra_a/extra_b has to appear in pair.
            if extra_a is not None and extra_b is None:
                abort(400)
            elif extra_a is None and extra_b is not None:
                abort(400)
            #ok, as we have both extra_a/extra_b...
            elif extra_a is not None and extra_b is not None:
                #penalty_a/penalty_b has to appear in pair.
                if penalty_a is not None and penalty_b is None:
                    abort(400)
                elif penalty_a is None and penalty_b is not None:
                    abort(400)
            #no extra_a/extra_b, no penalty_a/penalty_b allowed
            else:
                if penalty_a is not None or penalty_b is not None:
                    abort(400)

        if len(bets)==0:
            bet = Bet(userid=user.user_id(),
                      useremail=user.email(),
                      bet_match_id=int(match_id),
                      bet_amount=int(bet_amount),
                      score_a=int(score_a or 0) if score_a else None,
                      score_b=int(score_b or 0) if score_b else None,
                      extra_a=int(extra_a or 0) if extra_a else None,
                      extra_b=int(extra_b or 0) if extra_b else None,
                      penalty_a=int(penalty_a or 0) if penalty_a else None,
                      penalty_b=int(penalty_b or 0) if penalty_b else None
                      )
            logging.info('betting on %s' % str(bet))
            bet.put()
            result = bet.to_dict()
        else:
            bet = bets[0]
            bet.useremail=user.email()
            bet.bet_amount=int(bet_amount)
            if score_a:
                bet.score_a = int(score_a)
            if score_b:
                bet.score_b = int(score_b)
            if extra_a:
                bet.extra_a = int(extra_a)
            if extra_b:
                bet.extra_b = int(extra_b)
            if penalty_a:
                bet.penalty_a = int(penalty_a)
            if penalty_b:
                bet.penalty_b = int(penalty_b)
            bet.put()
            result = bet.to_dict()
        result['match'] = match.to_dict()
        return json_response(result)

@app.route('/mybet')
@app.route('/mybet/<match_id>')
def mybet(match_id=None):    
    user = users.get_current_user()
    if not user:
        abort(401)
    else:
        bets = None
        if match_id is not None:
            bets = Bet.query(ndb.AND(Bet.userid==user.user_id(), Bet.bet_match_id==int(match_id))).fetch()
        else:
            bets = Bet.query(Bet.userid==user.user_id()).fetch()
        results = []
        for bet in bets:
            result = bet.to_dict()
            match = Match.fetch_by_id(bet.bet_match_id)
            result['match'] = match.to_dict()
            results.append(result)
        return json_response(results)

@app.errorhandler(400)
def invalid_parameter(error):
    return Response('Ajax API raises invalid parameter error.', 400)

@app.errorhandler(401)
def require_login(error):
    logging.info('401:%s' % request.referrer)
    return Response('Ajax APIs requires user to login first.', 401, {'WWWAuthenticate':'Basic realm="Login Required"','LoginUrl':users.create_login_url(request.referrer or url_for('main'))})

@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    return Response('Sorry, nothing at this URL.', 404)

if __name__ == '__main__':
    app.run()