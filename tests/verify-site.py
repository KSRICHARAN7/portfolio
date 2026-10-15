from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.links=[];self.titles=0;self.h1=0;self.navlinks=[];self.innav=False;self.feed(s)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='nav':self.innav=True
  if tag=='h1':self.h1+=1
  if tag=='title':self.titles+=1
  if 'id' in a:self.ids.append(a['id'])
  for k in ['href','src','data']:
   if k in a:self.links.append(a[k])
  if self.innav and tag=='a':self.navlinks.append(a.get('href',''))
 def handle_endtag(self,tag):
  if tag=='nav':self.innav=False
pages={f:Page(f.read_text()) for f in ROOT.glob('*.html')}
for file,page in pages.items():
 assert page.h1==1,(file,'expected one h1',page.h1)
 assert page.titles==1,(file,'title missing')
 assert len(set(page.ids))==len(page.ids),(file,'duplicate IDs')
 assert all(not h.startswith('#') for h in page.navlinks),(file,'navigation must use real pages')
 for href in page.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=file.parent/unquote(u.path) if u.path else file
  if target.is_dir():target=target/'index.html'
  assert target.is_file(),(file.name,href,'missing local resource')
  if u.fragment and target.suffix=='.html':assert u.fragment in Page(target.read_text()).ids,(file.name,href,'missing anchor')
print(f'PASS: {len(pages)} pages, page navigation, local assets and fragment links.')
source=ROOT.parent/'emg-publish'
if source.exists():
 original5=json.loads((source/'results/db5/paired_statistics.json').read_text())['primary']
 original2=json.loads((source/'results/db2/paired_contrasts.json').read_text())
 assert json.loads((ROOT/'emg/study-results.json').read_text())=={'db5':original5,**original2}
 print('PASS: displayed study-result records match published benchmark output exactly.')
