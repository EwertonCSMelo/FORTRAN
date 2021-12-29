#! /bin/sh
# Este gs tem por finalidade gerar os Binarios, para ser lido pelo programa geraDP.x, 
# a partir de um arquivo visualizavel em GrADS.
#
# Demerval S. Moreira (demerval@master.iag.usp.br) 02/Mai/2003
#
function main(args)
nome=subwrd(args,1)
nX=subwrd(args,2); loni=subwrd(args,3); intX=subwrd(args,4)
nY=subwrd(args,5); lati=subwrd(args,6); intY=subwrd(args,7)
nlev=subwrd(args,8);nt=subwrd(args,9);def=subwrd(args,10)
linear=subwrd(args,11);u=subwrd(args,12);v=subwrd(args,13)
temp=subwrd(args,14);geo=subwrd(args,15);ur=subwrd(args,16)
zmax=subwrd(args,17);lat2i=subwrd(args,18);lat2f=subwrd(args,19)
lon2i=subwrd(args,20);lon2f=subwrd(args,21);to_f90=subwrd(args,22)
if (to_f90="S")
  'open 'nome''
  z=1
  lev=""
  while (z<=nlev)
    'set z 'z''
    'q dims'
    vlev=sublin(result,4);vlev=subwrd(vlev,6)
    lev=lev" "vlev
    z=z+1
  endwhile
  dims=nlev' 'nX' 'nY' 'loni' 'lati' 'intX' 'intY' '
  lixo=write(dims.txt,dims)
  lixo=write(dims.txt,lev)
  lixo=write(dims.txt,nt)
  t=1
  while (t<=nt)
    'set t 't''
    'q time'
     tempo=subwrd(result,3)
     hora=substr(tempo,1,2)
     dia=substr(tempo,4,2)
     mes=substr(tempo,6,3)
     ano=substr(tempo,9,4)

     if (mes=JAN); mesC=01; endif
     if (mes=FEB); mesC=02; endif
     if (mes=MAR); mesC=03; endif
     if (mes=APR); mesC=04; endif
     if (mes=MAY); mesC=05; endif
     if (mes=JUN); mesC=06; endif
     if (mes=JUL); mesC=07; endif
     if (mes=AUG); mesC=08; endif
     if (mes=SEP); mesC=09; endif
     if (mes=OCT); mesC=10; endif
     if (mes=NOV); mesC=11; endif
     if (mes=DEC); mesC=12; endif
 
     lixo=write(dims.txt,'dp'ano'-'mesC'-'dia'-'hora'00')
     t=t+1
   endwhile
   lixo=close(dims.txt)
  'quit'
endif

say "oi"

if (linear="e" | linear="E");intY=intX;endif  ;* se ydef for em levels
if (lat2i=-999);lat2i="";endif
if (lat2f=-999);lat2f="";endif
if (lon2i=-999);lon2i="";endif
if (lon2i=-999);lon2i="";endif
faz=zmax
'open 'nome''
'set mpdset mres'
'set map 1 1 6'
'q file'
say result

if (faz="")
  say
  prompt "Entre com o nome da variavel <vento zonal> (ex: u)=>"
  pull u
* u=uvel
  say
  prompt "Entre com o nome da variavel <vento meridional> (ex: v)=>"
  pull v
* v=vvel
  say
  prompt "Entre com o nome da variavel <tempetatura em kelvin> (ex: tempK ou temp+273.16)=>"
  pull temp
* temp=temp
  say
  prompt "Entre com o nome da variavel <geopotencial> (ex: geo)=>"
  pull geo
* geo=zgeo
  say
  prompt "Entre com o nome da variavel <umidare relativa em %> (ex: ur ou ur*100)=>"
  pull ur
* ur="umrl*100"
  say
  prompt "Entre com o numero de niveis da umidare relativa (ex: 8)=>"
  pull zmax
* zmax=8
  say
endif


say nX"   "loni"   "intX"   "nY"   "lati"   "intY"   "nlev"   "nt"   "u"   "v"   "temp"   "geo"   "ur
xi=1;xf=nX
yi=1;yf=nY
'd 'u''
say
if (faz="")
  prompt "Entre com lati e latf (ex: -80 20) ou <Enter> p/ continuar=>"
  pull lat2i lat2f
endif
if (lat2i!="")
  'set lat 'lat2i' 'lat2f''
  'q dims'
  a=sublin(result,3);a=subwrd(a,11)
  i=1;b=""
  while (i<=5)
    if (substr(a,i,1)!=".");b=b''substr(a,i,1);else; i=999;endif
    i=i+1
  endwhile
  if (b<=0);say "yi eh negativo,  saindo..."; 'quit'; endif
  if (b<1);b=1; endif
  yi=b
  'q dims'
  a=sublin(result,3);a=subwrd(a,13)
  i=1;b=""
  while (i<=5)
    if (substr(a,i,1)!=".");b=b''substr(a,i,1);else; i=999;endif
    i=i+1
  endwhile
  yf=b
  'set y 'yi' 'yf''
  'clear'
  'd 'u''
  if (faz="")
    prompt "Entre com loni e lonf (ex: 250 350) ou <Enter> p/ continuar=>"
    pull lon2i lon2f
  endif
  if (lon2i!="")
    'set lon 'lon2i' 'lon2f''
    'q dims'
    a=sublin(result,2);a=subwrd(a,11)
    i=1;b=""
    while (i<=5)
    if (substr(a,i,1)!=".");b=b''substr(a,i,1);else; i=999;endif
    i=i+1
    endwhile
    if (b<=0);say "xi eh negativo,  saindo..."; 'quit'; endif
    if (b<1);b=1; endif
    xi=b
    'q dims'
    a=sublin(result,2);a=subwrd(a,13)
    i=1;b=""
    while (i<=5)
      if (substr(a,i,1)!=".");b=b''substr(a,i,1);else; i=999;endif
      i=i+1
    endwhile
    xf=b
    'set x 'xi' 'xf''
    'clear'
    'd 'u''
  endif
endif

'set x 'xi' 'xf''
'set y 'yi' 'yf''
'q dims'
lon=sublin(result,2);loni=subwrd(lon,6);xi=subwrd(lon,11);xf=subwrd(lon,13)
nX=(xf-xi)+1
lat=sublin(result,3);lati=subwrd(lat,6);yi=subwrd(lat,11);yf=subwrd(lat,13)
nY=(yf-yi)+1

*nlev=2  ;*tmp
z=1
lev=""
while (z<=nlev)
  'set z 'z''
  'q dims'
  vlev=sublin(result,4);vlev=subwrd(vlev,6)
  lev=lev" "vlev
  z=z+1
endwhile

*nt=1   ;*tmp
t=1
nt2=nt
ts=""
while (t<=nt2)
  'clear'
  'set t 't''
  'set z 1'  
  'd 'u''
  ne=subwrd(result,6)
  if (ne!="undefined");ts=ts" "t;else; nt=nt-1;endif
  t=t+1
endwhile

dims=nlev' 'nX' 'nY' 'loni' 'lati' 'intX' 'intY' '
lixo=write(dims.txt,dims)
lixo=write(dims.txt,lev)
lixo=write(dims.txt,nt)

'set gxout fwrite'
'set fwrite to_dp.gra'
t=1
while (t<=nt)
  tempo=subwrd(ts,t)
  'set t 'tempo''
  'q time'
   tempo=subwrd(result,3)
   hora=substr(tempo,1,2)
   dia=substr(tempo,4,2)
   mes=substr(tempo,6,3)
   ano=substr(tempo,9,4)

   if (mes=JAN); mesC=01; endif
   if (mes=FEB); mesC=02; endif
   if (mes=MAR); mesC=03; endif
   if (mes=APR); mesC=04; endif
   if (mes=MAY); mesC=05; endif
   if (mes=JUN); mesC=06; endif
   if (mes=JUL); mesC=07; endif
   if (mes=AUG); mesC=08; endif
   if (mes=SEP); mesC=09; endif
   if (mes=OCT); mesC=10; endif
   if (mes=NOV); mesC=11; endif
   if (mes=DEC); mesC=12; endif
   
   lixo=write(dims.txt,'dp'ano'-'mesC'-'dia'-'hora'00')

***** U *******
  z=1
  while (z<=nlev)
    'clear'
    'set z 'z''
    'd 'u''
    z=z+1
  endwhile
***** V *******
  z=1
  while (z<=nlev)
    'clear'
    'set z 'z''
    'd 'v''
    z=z+1
  endwhile
***** TEMPK *******
  z=1
  while (z<=nlev)
    'clear'
    'set z 'z''
    'd 'temp''
    z=z+1
  endwhile
***** GEO *******
  z=1
  while (z<=nlev)
    'clear'
    'set z 'z''
    'd 'geo''
    z=z+1
  endwhile
***** UR em frac *******
  z=1
  while (z<=nlev)
    'clear'
    'set z 'z''
    if (z<=zmax)
      'd 'ur''
    else
      'd 'u'*0.0+20.1'   ;* coloca uma UR constante igual a 20.1%
    endif
    z=z+1
  endwhile

*  Read surface fields
*O campo de superficie serah escrito constante igual a zero.

  t=t+1
endwhile
'disable fwrite'

lixo=close(dims.txt)

'quit'
