import logging
import json
import time
import csv
from datetime import datetime

from flask import Flask,request,render_template,send_from_directory,make_response,redirect,url_for

from google.appengine.ext import ndb
from google.appengine.api import users

from model import Match

import admin

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FTUEVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/admin')
def admin():
    """Admin page"""
    if users.is_current_user_admin():
      method = request.args.get('m','')
      logging.info('Method name:[%s]' % method)
      if method == 'initdb':
          with open('worldcup2014-group-stage.csv', 'rb') as csvfile:
              spamreader = csv.reader(csvfile)
              for row in spamreader:
                  match = Match(matchid=int(row[0]),
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
          return render_template('admin.html', msg='Matches imported!')
      if method == 'initdb2':
          with open('worldcup2014-knockoff-stage.csv', 'rb') as csvfile:
              spamreader = csv.reader(csvfile)
              for row in spamreader:
                  match = Match(matchid=int(row[0]),
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
          return render_template('admin.html', msg='Matches imported!')
      elif method == 'insertmatch':
          match_id = int(request.args.get('id',0))
          team_a = request.args.get('a',None)
          team_b = request.args.get('b',None)
          match_stage = request.args.get('s',None)
          match_date = request.args.get('d',None)
          score_a = request.args.get('sa',None)
          score_b = request.args.get('sb',None)
          extra_a = request.args.get('ea',None)
          extra_b = request.args.get('eb',None)
          penalty_a = request.args.get('pa',None)
          penalty_b = request.args.get('pb',None)

          matches = Match.query(Match.matchid==match_id).fetch()
          if len(matches)==0:
              match = Match(matchid=match_id,
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
                      (match.team_a, match.team_b))
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
      return render_template('admin.html', logout_url=users.create_logout_url('/admin'))
    else:
      return render_template('logout.html', logout_url=users.create_logout_url(request.path), login_url=users.create_login_url(request.path))
      