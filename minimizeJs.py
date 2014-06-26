import os
import time
from httplib import HTTPConnection 
from urllib import urlencode

files = [
    "js/main.js",
    "js/service/guesser.js",
    "js/service/miner.js",
    "js/directive/navbar.js",
    "js/directive/notice.js",
    "js/directive/footer.js",
    "js/directive/matchdiv.js",
    "js/directive/betmodal.js",
    "js/directive/betmodalextra.js",
    "js/directive/eulamodal.js",
    "js/directive/chartwin.js",
    "js/directive/chartfav.js",
    "js/directive/chartleast.js",
    "js/directive/spinner.js",
    "js/directive/chartallbets.js",
    "js/directive/chartpop.js",
    "js/directive/chartbetscoredist.js",
    "js/directive/chartbetmatchdist.js",
    "js/directive/charttopbet.js",
    "js/view/topview.js",
    "js/view/home.js",
    "js/view/date.js",
    "js/view/my.js",
    "js/view/betanalysis.js",
    "js/view/bestbet.js",
    "js/view/carlnan.js"
]

raw_files = [
    "js/third-party/Chart.min.js",
    "js/third-party/moment.min.js"
]

copyright = '/*! GuessWorldCup2014 (c) 2014 */'

index_template = """{%% extends "base.html" %%}
{%% block script %%}
  <script src="//ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.0.min.js"></script>
  <script src="//ajax.aspnetcdn.com/ajax/bootstrap/3.1.1/bootstrap.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-route.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-animate.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-cookies.min.js"></script>
  <script src="%s"></script>
{%% endblock %%}"""

def replaceIndexHtml(root,filename):
    with open(os.path.join(root, 'templates/index.html'), 'w+') as f:
        f.write(index_template % filename)

def minimizeAllJs(root):
    minimized_content = minimizeJsHelper(combineFiles(root, files))
    raw_content = combineFiles(root, raw_files)
    filename = 'js/%s.js'%str(int(time.time()))
    with open(os.path.join(root, filename), 'w+') as f:
        f.write(raw_content)
        f.write('\n'+copyright+'\n')
        f.write(minimized_content)
    return filename

def combineFiles(root, file_list):
    combined_content = ''
    for file in file_list:
        with open(os.path.join(root,file),'r+') as f:
            combined_content += f.read()
            combined_content += '\n'
    return combined_content

def minimizeJs(path):
    js_content = None
    with open(path,'r+') as f:
        js_content = f.read()
    return minimizeJsHelper(js_content)

def minimizeJsHelper(js_content):
    headers = {"Content-type": "application/x-www-form-urlencoded",
        "Accept": "text/plain"}
    params = urlencode({
        'js_code': js_content, 
        'compilation_level': 'SIMPLE_OPTIMIZATIONS', 
        'output_format': 'text',
        'output_info': 'compiled_code'
        })
    conn = HTTPConnection('closure-compiler.appspot.com');
    conn.request('POST', '/compile', params, headers)
    r = conn.getresponse()
    if r.status == 200:
        data = r.read()
        if not data.startswith('Error'):
            return data
    return None

if __name__ == '__main__':
    root = os.path.dirname(os.path.abspath(__file__))
    replaceIndexHtml(root, minimizeAllJs(root))
