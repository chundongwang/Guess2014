import logging
import json
import os

from datetime import date
import time

from flask import Flask,request,render_template,send_from_directory,redirect,url_for,abort,Response,make_response,Markup

from google.appengine.ext import ndb
from google.appengine.api import users

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
    logging.info('login_url=[[%s]]' % str(login_url))
    return render_template(template, user_nickname=user_nickname, login_url=login_url)

@app.route('/list')
@app.route('/list/<stage_name>')
def list_matches(stage_name=None):
    """Return a list of match according to the stage name"""
    matches = []
    if stage_name is not None:
        matches_of_this_stage = [match.to_dict() for match in Match.query(Match.stage==stage_name).fetch()]
        matches_of_this_stage.sort(key=lambda match: match['date'])
        matches.append(matches_of_this_stage)
    else:
        group_stages=['Group '+g for g in ['A','B','C','D','E','F','G','H']]
        knockoff_stages=['Round of 16','Quarterfinals','Semi-Finals','Third-Place Play-Off','Final']
        for match_stage in group_stages:
            matches_of_this_stage = [match.to_dict() for match in Match.query(Match.stage==match_stage).fetch()]
            matches_of_this_stage.sort(key=lambda match: match['date'])
            matches.append(matches_of_this_stage)
        for match_stage in knockoff_stages:
            matches_of_this_stage = [match.to_dict() for match in Match.query(Match.stage==match_stage).fetch()]
            matches_of_this_stage.sort(key=lambda match: match['date'])
            matches.append(matches_of_this_stage)
    response = make_response(json.dumps(matches, cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    return response

@app.route('/list_by_date')
def list_matches_by_date():
    """Return a list of match list group by date"""
    matches_by_date = {}
    for match in Match.query().fetch():
        d = date.fromtimestamp(time.mktime(match.date.timetuple()))
        if not d in matches_by_date:
            matches_by_date[d] = []
        matches_by_date[d].append(match.to_dict())
    response = make_response(json.dumps(sorted(matches_by_date.values(), key=lambda list: list[0]['date']), cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    return response

@app.route('/bet/<match_id>')
@app.route('/bet/<match_id>/<bet_amount>')
def bet(match_id, bet_amount=1):
    """Put down a bet"""
    user = users.get_current_user()
    if not user:
        abort(401)
        #return redirect(users.create_login_url(url_for('main')))
    else:
        match = Match.query(Match.matchid==int(match_id)).fetch(1)[0]
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
        response = make_response(json.dumps(result, cls=DateTimeEncoder))
        response.headers['Content-Type'] = 'application/json'
        response.headers['mimetype'] = 'application/json'
        return response

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
            match = Match.query(Match.matchid==int(bet.bet_match_id)).fetch(1)[0]
            result['match'] = match.to_dict()
            results.append(result)
        response = make_response(json.dumps(results, cls=DateTimeEncoder))
        response.headers['Content-Type'] = 'application/json'
        response.headers['mimetype'] = 'application/json'
        return response

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