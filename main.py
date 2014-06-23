import logging
import json
import os

from datetime import date,datetime,timedelta
import time

from flask import Flask,request,render_template,send_from_directory,redirect,url_for,abort,Response,make_response,Markup

from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.api import memcache

from model import Match,Bet,Preference,Donate,DateTimeEncoder


app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

_is_local = os.environ['SERVER_SOFTWARE'].startswith('Development')

def isLocal():
    return _is_local

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
    "Saybye.Yu@gmail.com":"Shawn Yu",
    "lilylihou@gmail.com":"Lily Hou"
}

def known_user_name(useremail):
    if useremail in known_users:
        return known_users[useremail]
    elif useremail == 'chundongwang@gmail.com':
        return 'Chundong Wang'
    elif useremail == 'yanping.li@gmail.com':
        return 'Yanping Li'
    return useremail

def is_known_user(useremail):
    if useremail == 'chundongwang@gmail.com' or useremail == 'yanping.li@gmail.com':
        return True
    return useremail in known_users

@app.route('/')
def main():
    user = users.get_current_user()
    login_url = None
    user_nickname = None
    pref = None
    if not user:
        # call Markup or we'll end up with escaped url
        login_url = Markup(users.create_login_url(url_for('main')))
    else:
        user_nickname = user.nickname()
        pref = Preference.fetch_by_userid(user.user_id())
    #index.html is for prod, index2.html for local development
    template = 'index.html'
    if isLocal():
        template = 'index2.html'
    logging.info('%s just visited' % str(user_nickname))
    return render_template(template, user_nickname=user_nickname, login_url=login_url, pref=pref)

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

    show_known_user = is_known_user(user.email())
    bet_results = []
    for bet in bets:
        result = bet.to_dict()
        result['useremail'] = known_user_name(result['useremail'])
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

@app.route('/bestbet')
def bestbet():
    user = users.get_current_user()
    if not user:
        abort(401)
    else:
        show_known_user = is_known_user(user.email())
        final_results = memcache.get('[BestBet]'+str(show_known_user))
        if final_results is None:
            if show_known_user:
                matches = Match.fetch_all()
                finished_matches = []
                for match in matches:
                    if match.score_a is not None and match.score_b is not None:
                        finished_matches.append(match)
                finished_matches = sorted(finished_matches, cmp=lambda x, y:cmp(x.date,y.date))
                results = {} #key:useremail/known_name, value:rightAboutScore/rightAboutWin
                slipped_award = 0.0
                for match in finished_matches:
                    bets = Bet.fetch_by_matchid(match.matchid)
                    #collect slipped award
                    award_pool = {'total_amount':len(known_users)*3.0+slipped_award,'bingo_count':0,'bingo_user':[]}
                    slipped_award = 0.0
                    for bet in bets:
                        #only process known users
                        if not is_known_user(bet.useremail) or bet.useremail=='chundongwang@gmail.com' or bet.useremail=='yanping.li@gmail.com':
                            logging.info('%s is not known user, skip it.' % str(bet.useremail))
                            continue
                        #replace with known name
                        bet.useremail = known_user_name(bet.useremail)
                        #initialize results for this user
                        if bet.useremail not in results:
                            results[bet.useremail] = {'rightAboutScore':0,'rightAboutWin':0,'points':0}
                        #Bingo!
                        if match.score_a == bet.score_a and match.score_b == bet.score_b:
                            results[bet.useremail]['rightAboutScore']+=1
                            award_pool['bingo_count']+=1
                            award_pool['bingo_user'].append(bet.useremail)
                        if cmp(match.score_a, match.score_b) == cmp(bet.score_a, bet.score_b):
                            results[bet.useremail]['rightAboutWin']+=1
                    #no one bingo, the pool goes to next match
                    if award_pool['bingo_count'] == 0:
                        slipped_award = award_pool['total_amount']
                        logging.info('Award %d of match between %s and %s slipped to next match' % (slipped_award, match.team_a, match.team_b))
                    else:
                        award = award_pool['total_amount']/award_pool['bingo_count']
                        logging.info('Award %d of match between %s and %s got distributed to following users, %d for each: %s' 
                            % (award_pool['total_amount'], match.team_a, match.team_b, award, ','.join(award_pool['bingo_user'])))
                        for awarded_user in award_pool['bingo_user']:
                            results[awarded_user]['points']+=award
                #sort by points/rightAboutScore/rightAboutWin for output
                final_results = sorted(results.iteritems(), reverse=True, 
                    cmp=lambda x, y: cmp(x[1]['points'], y[1]['points']) or cmp(x[1]['rightAboutScore'], y[1]['rightAboutScore']) or cmp(x[1]['rightAboutWin'],y[1]['rightAboutWin']))
                final_results = {"slipped_award":slipped_award, "results":final_results}

            else: #not known user:
                bets = Bet.fetch_all()
                results = {}
                for bet in bets:
                    #only process bets of finished matches
                    match = Match.fetch_by_id(bet.bet_match_id)
                    if match.score_a is None or match.score_b is None:
                        continue
                    #statistic
                    if bet.useremail not in results:
                        results[bet.useremail] = {'rightAboutScore':0,'rightAboutWin':0}
                    result = results[bet.useremail]
                    if match.score_a == bet.score_a and match.score_b == bet.score_b:
                        results[bet.useremail]['rightAboutScore']+=1
                    if cmp(match.score_a, match.score_b) == cmp(bet.score_a, bet.score_b):
                        results[bet.useremail]['rightAboutWin']+=1
                final_results = sorted(results.iteritems(), reverse=True, cmp=lambda x, y: cmp(x[1]['rightAboutScore'], y[1]['rightAboutScore']) or cmp(x[1]['rightAboutWin'],y[1]['rightAboutWin']))

        # expire in 5 minutes
        memcache.set('[BestBet]'+str(show_known_user), final_results, 300)
        return json_response(final_results)

@app.route('/eula')
def eula():
    user = users.get_current_user()
    if not user:
        abort(401)
    else:
        pref = Preference.fetch_by_userid(user.user_id())
        if pref is None:
            pref = Preference(userid=user.user_id(),
                eulaAccepted=True)
            pref.put()
        else:
            pref.eulaAccepted = True
            pref.put()
    return json_response([])

@app.route('/donate_list')
def donate_list():    
    user = users.get_current_user()
    if not user:
        abort(401)
    else:
        show_known_user = is_known_user(user.email())
        email_only = request.args.get('email',None)
        results = []
        donates = []
        if email_only is None:
            donates = Donate.fetch_all()
        else:
            donates = Donate.fetch_email_distinct()
        for donate in donates:
            result = donate.to_dict()
            #replace with known name
            if show_known_user:
                result["useremail"] = known_user_name(donate.useremail)
            results.append(result)
    return json_response(results)

@app.route('/donate')
def donate():    
    user = users.get_current_user()
    if not user:
        abort(401)
    else:
        show_known_user = is_known_user(user.email())
        donate = {}
        count = request.args.get('c',None)
        reason = request.args.get('r',None)
        message = request.args.get('m',None)
        if count is None or reason is None or message is None:
            abort(400)
        else:
            donate = Donate(userid=user.user_id(),
                            useremail=user.email(),
                            count=int(request.args.get('c',None)),
                            reason=int(request.args.get('r',None)),
                            message=request.args.get('m',None)
                            )
            donate.put()
            #replace with known name
            if show_known_user:
                donate.useremail = known_user_name(donate.useremail)
        return json_response(donate.to_dict())

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