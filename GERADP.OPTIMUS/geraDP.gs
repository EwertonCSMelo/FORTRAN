#! /bin/sh 
# Este gs tem por finalidade gerar os dp's a partir de um arquivo  
# visualizavel em GrADS. (combinado com o geraDP.sh) 
# 
# Demerval 11/Abr/2002 
# 
function main(args) 
nome=subwrd(args,1) 
nX=subwrd(args,2); loni=subwrd(args,3); intX=subwrd(args,4) 
nY=subwrd(args,5); lati=subwrd(args,6); intY=subwrd(args,7) 
nlev=subwrd(args,8);nt=subwrd(args,9);def=subwrd(args,10) 
linear=subwrd(args,11);u=subwrd(args,12);v=subwrd(args,13) 
temp=subwrd(args,14);geo=subwrd(args,15);ur=subwrd(args,16) 
zmax=subwrd(args,17);lat2i=subwrd(args,18);lat2f=subwrd(args,19) 
lon2i=subwrd(args,20);lon2f=subwrd(args,21) 
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
  prompt "Entre com o nome da variavel <vento zonal> (ex: uvel)=>" 
  pull u 
* u=uvel 
  say 
  prompt "Entre com o nome da variavel <vento meridional> (ex: vvel)=>" 
  pull v 
* v=vvel 
  say 
  prompt "Entre com o nome da variavel <tempetatura em kelvin> (ex: tempK ou temp+273.16)=>" 
  pull temp 
* temp=temp 
  say 
  prompt "Entre com o nome da variavel <geopotencial> (ex: zgeo)=>" 
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
  'clear' 
  'd 'u'' 
  if (faz="") 
    prompt "Entre com loni e lonf (ex: 250 350) ou <Enter> p/ continuar=>" 
    pull lon2i lon2f 
  endif 
  if (lon2i!="") 
    'set lon 'lon2i' 'lon2f'' 
    'clear' 
    'd 'u'' 
  endif 
  'q dims' 
  lon=sublin(result,2);loni=subwrd(lon,6);xi=subwrd(lon,11);xf=subwrd(lon,13) 
  nX=(xf-xi)+1 
  lat=sublin(result,3);lati=subwrd(lat,6);yi=subwrd(lat,11);yf=subwrd(lat,13) 
  nY=(yf-yi)+1 
  say nX"   "loni"   "intX"   "nY"   "lati"   "intY"   "nlev"   "nt"   "u"   "v"   "temp"   "geo"   "ur 
endif 
   
 
 
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
  
*nt=20   ;*tmp 
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
  'clear' 
  'set x 'xi' 'xf'' 
  'set y 'yi' 'yf'' 
  'set z 1'   
  'd 'u'' 
  ne=subwrd(result,6) 
 say "   ---->" ano' 'mesC' 'dia' 'hora"    t="t"/"nt 
 if (ne!="undefined")  
    
 
   titulo=ano' 'mesC' 'dia' 'hora' 'nlev' 'nX' 'nY' 'loni' 'lati' 'intX' 'intY 
   lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00', titulo) 
   lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00', lev) 
 
*   if (linear="e" | linear="E");lixo=regrid(nlev,xi,xf,yi,yf,intX,zmax,u,v,temp,geo,ur,uL,vL,tL,geoL,urL); endif 
 
z=1 
while (z<=nlev) 
'set z 'z'' 
 
***** U ******* 
  k=1 
  var8='' 
  j=yi 
  while (j<=yf) 
    'set y 'j'' 
    i=xi 
    while (i<=xf) 
      'set x 'i'' 
      if (linear="i" | linear="I")  ;* se ydef for em linear 
        'd 'u'' 
        var=subwrd(result,4) 
      else 
        say "Intervalo de Y nao eh linear, utilize previamente o regrid. Saindo..." 
        'quit'  
      endif 
      if (var="Operand"|var=def);var="-999.0";endif 
*     var=i"x"j 
      if (k<=8) 
        var8=var8'  'var 
        k=k+1 
      else 
        lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8) 
        var8='  'var 
        k=2 
      endif 
      i=i+1 
    endwhile 
    j=j+1 
  endwhile 
  if (k>1&k<=8);lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8);endif 
 
***** V ******* 
  k=1 
  var8='' 
  j=yi 
  while (j<=yf) 
    'set y 'j'' 
    i=xi 
    while (i<=xf) 
      'set x 'i'' 
      if (linear="i" | linear="I")  ;* se ydef for em linear 
        'd 'v'' 
        var=subwrd(result,4) 
      else 
        say "Intervalo de Y nao eh linear, utilize previamente o regrid. Saindo..." 
        'quit'  
      endif 
      if (var="Operand"|var=def);var="-999.0";endif 
*     var=i"x"j 
      if (k<=8) 
        var8=var8'  'var 
        k=k+1 
      else 
        lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8) 
        var8='  'var 
        k=2 
      endif 
      i=i+1 
    endwhile 
    j=j+1 
  endwhile 
  if (k>1&k<=8);lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8);endif 
 
***** TEMPK ******* 
  k=1 
  var8='' 
  j=yi 
  while (j<=yf) 
    'set y 'j'' 
    i=xi 
    while (i<=xf) 
      'set x 'i'' 
      if (linear="i" | linear="I")  ;* se ydef for em linear 
        'd 'temp'' 
        var=subwrd(result,4) 
      else 
        say "Intervalo de Y nao eh linear, utilize previamente o regrid. Saindo..." 
        'quit'  
      endif 
       if (var="Operand"|var=def);var="-999.0";endif 
*      var=i"x"j 
      if (k<=8) 
        var8=var8'  'var 
        k=k+1 
      else 
        lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8) 
        var8='  'var 
        k=2 
      endif 
      i=i+1 
    endwhile 
    j=j+1 
  endwhile 
  if (k>1&k<=8);lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8);endif 
 
***** GEO ******* 
  k=1 
  var8='' 
  j=yi 
  while (j<=yf) 
    'set y 'j'' 
    i=xi 
    while (i<=xf) 
      'set x 'i'' 
      if (linear="i" | linear="I")  ;* se ydef for em linear 
        'd 'geo'' 
        var=subwrd(result,4) 
      else 
        say "Intervalo de Y nao eh linear, utilize previamente o regrid. Saindo..." 
        'quit'  
      endif 
      if (var="Operand"|var=def);var="-999.0";endif 
*      var=i"x"j 
      if (k<=8) 
        var8=var8'  'var 
        k=k+1 
      else 
        lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8) 
        var8='  'var 
        k=2 
      endif 
      i=i+1 
    endwhile 
    j=j+1 
  endwhile 
  if (k>1&k<=8);lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8);endif 
 
***** UR em frac ******* 
  k=1 
  var8='' 
  j=yi 
  while (j<=yf) 
    'set y 'j'' 
    i=xi 
    while (i<=xf) 
      'set x 'i'' 
      if (z<=zmax) 
        if (linear="i" | linear="I")  ;* se ydef for em linear 
           'd 'ur'' 
           var=subwrd(result,4) 
        else 
        say "Intervalo de Y nao eh linear, utilize previamente o regrid. Saindo..." 
        'quit'  
        endif 
      else 
         var=20.1 
      endif	   
*       say var"|" 
       if (var="Operand"|var=def|var="Request");var="-999.0";else;var=var/100;endif 
*      var=i"x"j 
      if (k<=8) 
        var8=var8'  'var 
        k=k+1 
      else 
        lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8) 
        var8='  'var 
        k=2 
      endif 
      i=i+1 
    endwhile 
    j=j+1 
  endwhile 
  if (k>1&k<=8);lixo=write ('dp'ano'-'mesC'-'dia'-'hora'00',var8);endif 
z=z+1 
endwhile 
 
 lixo=close('dp'ano'-'mesC'-'dia'-'hora'00')  
 endif ;* Fim do if (ne!="undefined") 
  t=t+1 
endwhile 
 
'quit' 
return 
 
function levels(var,t,fun,i,j,nt,loni,lonf,lati,latf,intX,uL,vL,tL,geoL,urL) 
  'd 'fun'' 
  var=subwrd(result,4) 
 say "------------------------------------" 
  _var=var 
 
return 
 
 
function regrid(nlev,xi,xf,yi,yf,intX,zmax,u,v,temp,geo,ur,uL,vL,tL,geoL,urL) 
  'set x 'xi' 'xf'' 
  'set y 'yi' 'yf'' 
  'set z 1 'nlev'' 
  'define uL=regrid2('u','intX')' 
  'define vL=regrid2('v','intX')' 
  'define tL=regrid2('temp','intX')' 
  'define geoL=regrid2('geo','intX')' 
  'set z 1 'zmax'' 
  'define urL=regrid2('ur','intX')' 
return 
