import os
cwd=os.getcwd()
res=os.listdir(cwd)
for i in res:
    if ".png" in i:
        os.rename(os.path.join(cwd,i),os.path.join(cwd, i.rjust(7, '0')))