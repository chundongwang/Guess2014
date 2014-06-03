import sys
import csv

from model import Match
from google.appengine.ext import ndb

def initdb(path):
    print(path)
    with open(path, 'rb') as csvfile:
        spamreader = csv.reader(csvfile)
        for row in spamreader:
            print ','.join(row)

if __name__ == '__main__':
    path = None
    if len(sys.argv)>1:
        path = sys.argv[1]
    initdb(path or 'worldcup2014/worldcup2014.csv')