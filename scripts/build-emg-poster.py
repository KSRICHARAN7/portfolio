from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor,white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
R=Path(__file__).resolve().parents[1];out=R/'materials/emg/EMG_Engineering_Poster.pdf';out.parent.mkdir(parents=True,exist_ok=True)
for name,file in [('Sans','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
W,H=1296,1728;c=canvas.Canvas(str(out),pagesize=(W,H));c.setTitle('EMG command filtering - engineering research poster');c.setAuthor('Sricharan Karthigeyan')
ink='#202329';muted='#58616f';blue='#3156db';orange='#c95d2e';line='#dce2ec';paper='#f8faff'
def box(x,y,w,h,color,r=14):c.setFillColor(HexColor(color));c.roundRect(x,y,w,h,r,fill=1,stroke=0)
def text(s,x,y,size=20,font='Sans',color=ink):c.setFont(font,size);c.setFillColor(HexColor(color));c.drawString(x,y,s)
def para(s,x,top,width,size=20,leading=None,color=ink,font='Sans'):
 st=ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.42,textColor=HexColor(color),spaceAfter=0)
 p=Paragraph(s,st);_,h=p.wrap(width,3000);p.drawOn(c,x,top-h);return top-h

def rule(x,y,w):c.setStrokeColor(HexColor(line));c.setLineWidth(1);c.line(x,y,x+w,y)
def header(s,x,y):text(s,x,y,25,'Bold',blue)
box(0,0,W,H,paper,0);box(0,H-270,W,270,'#203982',0)
text('ENGINEERING RESEARCH  /  UNPUBLISHED MANUSCRIPT DRAFT',58,H-54,16,'Bold','#cad8ff')
y=para('Start and Stop Delay Constraints<br/>in EMG Command Filtering',58,H-81,W-116,47,57,'#ffffff','Bold')
text('A Reproducible Replay Benchmark',58,H-223,24,'Sans','#e1e8ff');text('Sricharan Karthigeyan  |  October 2026',58,H-253,18,'Sans','#e1e8ff')
box(58,1306,1180,116,'#e9efff');text('THE ORIGINAL HYPOTHESIS WAS UNSUPPORTED.',80,1383,21,'Bold',blue)
para('No tested development family met the joint requirements.',80,1366,1120,30,38,ink,'Bold')
L=58;RX=670;CW=568
header('01  The engineering question',L,1258)
y=para('Can separate start and stop persistence reduce unwanted commands during annotated rest while preserving timely, sustained movement commands?',L,1229,CW,21,30)
y=para('Suppressing short bursts can delay both starts and stops.',L,y-19,CW,20,29,muted)
header('02  What was built',L,1000)
steps=[('Decode','Personalized LDA; 150 ms trailing windows'),('Filter','Seven causal controller families'),('Replay','Hold each command until the next decision'),('Score','Timing, rest exposure, and correct/wrong output')]
y=970
for i,(name,detail) in enumerate(steps):
 box(L,y-66,CW,64,'#ffffff',9);text(str(i+1).zfill(2),L+15,y-28,17,'Bold',blue);text(name,L+56,y-27,19,'Bold');text(detail,L+56,y-51,14,'Sans',muted);y-=78
para('25 ms hops. Stable confirmation spans 100 ms and is recorded at the confirming endpoint, never backdated.',L,y-2,CW,18,26,muted)
header('03  Requirements assessed jointly',L,584)
requirements=[('START','At least 90% stable-correct onsets by 250 ms'),('STOP','At least 90% stable-rest confirmations by 150 ms'),('COVERAGE','At least 80% nonzero active-interior coverage')]
y=554
for a,b in requirements:
 text(a,L,y,14,'Bold',blue);y=para(b,L,y-11,CW,20,28)-21
para('Coverage includes wrong commands. It is not accuracy. The active interior begins 500 ms after onset.',L,y+3,CW,18,26,muted)
header('04  Actual paired comparisons',RX,1258)
para('Asymmetric minus symmetric persistence<br/>Change in command exposure during rest (percentage points)',RX,1229,CW,19,28)
records=json.loads((R/'emg/study-results.json').read_text()); names=[('db5','DB5 primary','8 final participants'),('transport','DB2 transported','32 final participants'),('reselected','DB2 reselected','Same 32 participants')]
px=RX+26;pw=CW-52;axisTop=1110;axisBottom=800
for tick in range(6):
 x=px+tick/5*pw;c.setStrokeColor(HexColor('#d8e0ef'));c.line(x,axisBottom,x,axisTop);text(str(tick),x-4,axisBottom-25,15,'Sans',muted)
for idx,(key,name,n) in enumerate(names):
 d=records[key];mean=d['mean_difference_pp'];lo,hi=d['bootstrap_95_percentile_interval_pp'];y=1076-idx*103
 text(name,px,y+31,18,'Bold');text(n,px+205,y+31,14,'Sans',muted)
 x1=px+lo/5*pw;x2=px+hi/5*pw;xm=px+mean/5*pw
 c.setStrokeColor(HexColor(orange));c.setLineWidth(4);c.line(x1,y,x2,y);c.line(x1,y-7,x1,y+7);c.line(x2,y-7,x2,y+7);c.setFillColor(HexColor(orange));c.circle(xm,y,6,fill=1,stroke=0)
 text(f'+{mean:.3f} pp  [{lo:.3f}, {hi:.3f}]',px,y-28,16,'Sans',ink)
para('Points: paired mean differences. Lines: descriptive paired bootstrap 95% intervals. Positive values mean more unwanted activation during annotated rest.',RX,747,CW,17,25,muted)
box(RX,526,CW,113,'#fff0df');text('0/8 DB5     0/32 DB2',RX+21,594,30,'Bold',orange)
para('Participants meeting all requirements, for every evaluated method: 14 DB5 methods and 19 DB2 methods.',RX+21,573,CW-42,17,24)
header('05  What the result means',RX,478)
y=para('The contribution is a reproducible benchmark and an explicit account of the tradeoffs, rather than a new control algorithm or a demonstrated improvement.',RX,451,CW,21,30)
y=para('The study includes 23 prespecified sensitivity cases and a DB2 replication at its native sample rate. Paired contrasts remain descriptive after failed development feasibility.',RX,y-20,CW,18,27,muted)
rule(58,244,1180)
text('SCOPE & LIMITS',58,215,15,'Bold',blue)
para('Offline intact-limb recordings, not a clinical or closed-loop prosthetic trial. Retrospective annotations do not measure intention. Dataset IDs do not establish independent biological cohorts. No journal publication is claimed.',58,199,976,17,25,muted)
text('Paper, code, poster, and interactive lab',58,87,19,'Bold')
text('ksricharan7.github.io/portfolio/emg.html',58,58,17,'Sans',blue)
c.linkURL('https://ksricharan7.github.io/portfolio/emg.html',(58,48,600,100),relative=0)
qr=QrCodeWidget('https://ksricharan7.github.io/portfolio/emg.html');b=qr.getBounds();size=113;d=Drawing(size,size,transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0]);d.add(qr);renderPDF.draw(d,c,1124,78)
text('Source: Ninapro DB5 and DB2; released benchmark outputs. Software release v0.11.0.',58,27,11,'Sans',muted)
c.showPage();c.save();print(out)
