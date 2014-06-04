import logging
import json

from flask import Flask,request,render_template,send_from_directory,redirect,url_for,abort,Response,make_response

from google.appengine.ext import ndb
from google.appengine.api import users

from model import Match,Bet,DateTimeEncoder

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
        login_url = users.create_login_url(url_for('main'))
    else:
        user_nickname = user.nickname()
    return render_template('index.html', user_nickname=user_nickname, login_url=login_url)

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

@app.route('/bet/<match_id>')
@app.route('/bet/<match_id>/<bet_amount>')
def bet(match_id, bet_amount=1):
    user = users.get_current_user()
    if not user:
        abort(401)
        #return redirect(users.create_login_url(url_for('main')))
    else:
        match = Match.query(Match.matchid==int(match_id)).fetch(1)[0]
        logging.info('betting on %s' % str(match))
        bets = Bet.query(ndb.AND(Bet.userid==user.user_id(), Bet.bet_match_id==int(match_id))).fetch()
        result = {}
        if len(bets)==0:
            bet = Bet(userid=user.user_id(),
                      useremail=user.email(),
                      bet_match_id=int(match_id),
                      bet_amount=int(bet_amount)
                      )
            logging.info('betting on %s' % str(bet))
            bet.put()
            result = bet.to_dict()
        else:
            bet = bets[0]
            bet.useremail=user.email()
            bet.bet_amount=int(bet_amount)
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
        if match_id!=None:
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


@app.errorhandler(401)
def custom_401(error):
    return Response('Ajax APIs requires user to login first.', 401, {'WWWAuthenticate':'Basic realm="Login Required"','LoginUrl':users.create_login_url(url_for('main'))})

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, nothing at this URL.', 404

if __name__ == '__main__':
    app.run()