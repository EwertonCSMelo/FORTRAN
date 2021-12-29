'reinit'
'open mp.us1505.6km.ctrl.1.ctl'
say 'INMET (1) PCD (2)'
pull tipo

*INMET
if (tipo=1)
'set lat -9.4 -9.4'
'set lon -40.5 -40.5'
nome=INMET
endif

*PCD
if (tipo=2)
'set lat -9.3 -9.3'
'set lon -40.7 -40.7'
nome=PCD
endif

'set fwrite uvhlet'%nome%'.grd'
'set gxout fwrite'

nv=5
var=1
while(var<=nv)
     ti=1
     tf=25
     tt=ti
   while (tt<=tf)
    'set t 'tt
* comp u
    if(var=1);'d u';endif
* comp v
    if(var=2);'d v';endif
* calor sensivel
    if(var=3);'d h';endif
* calor latente
    if(var=4);'d le';endif
* temperatura do ar
    if(var=5);'d tempc';endif
    tt=tt+1
   endwhile
   var=var+1
endwhile
'disable fwrite'
say "gerado arquivo"
'reinit'
