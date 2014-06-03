import logging
import json

from flask import Flask,make_response

from google.appengine.ext import ndb
from google.appengine.api import users

from model import Match,Bet,DateTimeEncoder

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/bet/<match_id>', methods=['GET'])
@app.route('/bet/<match_id>/<bet_amount>', methods=['GET'])
def bet(match_id, bet_amount=1):
    user = users.get_current_user()
    if not user:
        response = make_response(json.dumps({'error':'Not logged in'}))
    else:
        bets = Bet.query(ndb.AND(Bet.userid==user.user_id(), Bet.bet_match.matchid==int(match_id))).fetch()
        if len(bets)==0:
            match = Match.query(Match.matchid==int(match_id)).fetch(1)[0]
            logging.info('betting on %s' % str(match))
            bet = Bet(userid=user.user_id(),
                      useremail=user.email(),
                      bet_match=match,
                      bet_amount=int(bet_amount)
                      )
            logging.info('betting on %s' % str(bet))
            bet.put()
            response = make_response(json.dumps(bet.to_dict(), cls=DateTimeEncoder))
        else:
            bet = bets[0]
            bet.useremail=user.email()
            bet.bet_amount=int(bet_amount)
            bet.put()
            response = make_response(json.dumps(bet.to_dict(), cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    return response