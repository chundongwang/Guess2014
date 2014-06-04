import os
import logging

def rename_files(path):
    for filename in os.listdir(path):
        name,ext = os.path.splitext(filename)
        logging.info('name=%s,ext=%s'%(name,ext))
        if ext=='.png':
            logging.info('old:%s,new:%s'%(os.path.join(path,filename),os.path.join(path,name[:3]+ext)))
            os.rename(os.path.join(path,filename),os.path.join(path,name[:3]+ext))

if __name__ == '__main__':
    rename_files('C:\\Users\\Chundong\\OneDrive\\funproj\\Guess2014\\img\\')