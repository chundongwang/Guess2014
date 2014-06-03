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

@app.route('/admin', methods=['GET','POST'])
def admin():
    """Admin page"""
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
                              result=None
                              )
                match.put()
        return render_template('admin.html', msg='Matches imported!')
    elif method == 'insertmatch':
        match_id = int(request.args.get('id',0))
        team_a = request.args.get('a',None)
        team_b = request.args.get('b',None)
        match_stage = request.args.get('s',None)
        match_result = request.args.get('s',None)
        match_date = request.args.get('d',None)

        matches = Match.query(Match.matchid==match_id).fetch()
        if len(matches)==0:
            match = Match(matchid=match_id,
                          date=datetime.strptime(match_date, "%d %B %Y %H:%M"),
                          stage=match_stage,
                          team_a=team_a,
                          team_b=team_b,
                          result=None
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
            if match_result:
                match.result = match_result
            logging.info('update attempt:%s' % str(match))
            match.put()
            return render_template('admin.html',
                msg='Match between %s and %s has been updated!' % 
                    (match.team_a, match.team_b))
    return render_template('admin.html')