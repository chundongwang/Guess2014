import logging
import json
import time
import csv
import random
from datetime import datetime

from flask import Flask,request,render_template,send_from_directory,make_response,redirect,url_for

from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.api import mail

from model import Match,Bet

import admin

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

def send_mail(addr,subject,body):
    if mail.is_email_valid(addr):
        sender_address = "Guess Worldcup 2014 Support <support@guessworldcup2014.appspot.com>"
        logging.info('Sending email to %s with <%s>' % (addr, subject))
        mail.send_mail(sender_address, "chundongwang@gmail.com", subject, body)

@app.route('/admin')
def admin():
    """Admin page"""
    if users.is_current_user_admin():
        logout_url=users.create_logout_url('/admin')
        method = request.args.get('m','')
        logging.info('Method name:[%s]' % method)
        if method == 'dropdb':
            match_keys = Match.query().fetch(keys_only=True)
            ndb.delete_multi(match_keys)
            return render_template('admin.html', msg='Matches all deleted!', logout_url=logout_url)
        elif method == 'initdb':
            with open('worldcup2014-group-stage.csv', 'rb') as csvfile:
                spamreader = csv.reader(csvfile)
                for row in spamreader:
                    match = Match(  matchid=int(row[0]),
                                    date=datetime.strptime(str(row[1]), "%m/%d/%Y %H:%M"),
                                    stage=row[5],
                                    team_a=row[2],
                                    team_b=row[3],
                                    score_a=None,
                                    score_b=None,
                                    extra_a=None,
                                    extra_b=None,
                                    penalty_a=None,
                                    penalty_b=None
                                    )
                    match.put()
            return render_template('admin.html', msg='Matches imported!', logout_url=logout_url)
        elif method == 'initdb2':
            with open('worldcup2014-knockoff-stage.csv', 'rb') as csvfile:
                spamreader = csv.reader(csvfile)
                for row in spamreader:
                    match = Match(  matchid=int(row[0]),
                                    date=datetime.strptime(str(row[1]), "%m/%d/%Y %H:%M"),
                                    stage=row[5],
                                    team_a='winner of '+row[2],
                                    team_b='winner of '+row[3],
                                    score_a=None,
                                    score_b=None,
                                    extra_a=None,
                                    extra_b=None,
                                    penalty_a=None,
                                    penalty_b=None
                                    )
                    match.put()
            return render_template('admin.html', msg='Matches imported!', logout_url=logout_url)
        elif method == 'randombet':
            digits = 21
            uid = str(int(random.random()*10**digits)).rjust(digits,'0')
            email = 'test@example.com'
            matches = Match.query().fetch()
            for match in matches:
                bet = Bet(  userid=uid,
                            useremail=email,
                            bet_match_id=int(match.matchid),
                            bet_amount=1,
                            score_a=random.randint(0,3),
                            score_b=random.randint(0,3),
                            extra_a=None,
                            extra_b=None,
                            penalty_a=None,
                            penalty_b=None
                            )
                bet.put()
            return render_template('admin.html', msg='simulated bets for %s has been generated!'%uid, logout_url=logout_url)
        elif method == 'insertmatch':
            match_id = int(request.args.get('id',0))
            team_a = request.args.get('a',None) or None
            team_b = request.args.get('b',None) or None
            match_stage = request.args.get('s',None) or None
            match_date = request.args.get('d',None) or None
            score_a = request.args.get('sa',None) or None or None
            score_b = request.args.get('sb',None) or None
            extra_a = request.args.get('ea',None) or None
            extra_b = request.args.get('eb',None) or None
            penalty_a = request.args.get('pa',None) or None
            penalty_b = request.args.get('pb',None) or None

            matches = Match.query(Match.matchid==match_id).fetch()
            if len(matches)==0:
                match = Match(  matchid=match_id,
                                date=datetime.strptime(match_date, "%d %B %Y %H:%M"),
                                stage=match_stage,
                                team_a=team_a,
                                team_b=team_b,
                                score_a=None,
                                score_b=None,
                                extra_a=None,
                                extra_b=None,
                                penalty_a=None,
                                penalty_b=None
                                )
                logging.info('insert attempt:%s' % str(match))
                match.put()
                return render_template('admin.html',
                    msg='Match between %s and %s has been inserted!' % 
                        (match.team_a, match.team_b), logout_url=logout_url)
            else:
                match = matches[0]
                if match_date:
                    match.date = datetime.strptime(match_date, "%d %B %Y %H:%M")
                if match_stage:
                    match.stage = match_stage
                if team_a:
                    match.team_a = team_a
                if team_b:
                    match.team_b = team_b
                if score_a:
                    match.score_a = int(score_a)
                if score_b:
                    match.score_b = int(score_b)
                if extra_a:
                    match.extra_a = int(extra_a)
                if extra_b:
                    match.extra_b = int(extra_b)
                if penalty_a:
                    match.penalty_a = int(penalty_a)
                if penalty_b:
                    match.penalty_b = int(penalty_b)
                logging.info('update attempt:%s' % str(match))
                match.put()
                return render_template('admin.html',
                    msg='Match between %s and %s has been updated!' % 
                        (match.team_a, match.team_b))
        elif method == 'sendmail':
            match_id = int(request.args.get('id',0))
            logging.info('sendmail attempt:%s' % str(match_id))
            if match_id > 0:
                bets = Bet.query(Bet.bet_match_id==match_id).fetch()
                match = Match.query(Match.matchid==match_id).fetch()[0]
                addresses = []
                [addresses.append(str(bet.useremail)) for bet in bets]
                target_address = ';'.join(addresses)
                subject = "Match between %s and %s just started!" %(match.team_a, match.team_b)
                body =  "<a href=\"http://localhost:8080/#/my\">My guess</a>"
                send_mail(target_address, subject, body)
                return render_template('admin.html',
                    msg='Mail to %s with <%s> has succeeded!' % (target_address, subject))
            return render_template('admin.html',msg='You have to specify match id!', logout_url=logout_url)
        return render_template('admin.html', logout_url=logout_url)
    else:
        return render_template('logout.html', logout_url=users.create_logout_url(request.path), login_url=users.create_login_url(request.path))
      