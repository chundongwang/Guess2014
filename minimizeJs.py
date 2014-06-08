import os
import time
from httplib import HTTPConnection 
from urllib import urlencode

files = [
    "js/main.js",
    "js/directive/navbar.js",
    "js/directive/footer.js",
    "js/directive/groupdiv.js",
    "js/directive/betmodal.js",
    "js/service/guesser.js",
    "js/view/home.js",
    "js/view/group.js",
    "js/view/my.js"
]

raw_files = [
    "js/third-party/jquery.min.js",
    "js/third-party/bootstrap.min.js",
    "js/third-party/angular.min.js",
    "js/third-party/angular-route.min.js",
    "js/third-party/angular-animate.min.js",
    "js/third-party/angular-cookies.min.js"
]

copyright = '/*! GuessWorldCup2014 (c) 2014 */'

def minimizeAllJs(root):
    minimized_content = minimizeJsHelper(combineFiles(root, files))
    raw_content = combineFiles(root, raw_files)
    filename = os.path.join(root, 'js/%s.js'%str(int(time.time())))
    with open(filename, 'w+') as f:
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
    print(minimizeAllJs(os.path.dirname(os.path.abspath(__file__))))