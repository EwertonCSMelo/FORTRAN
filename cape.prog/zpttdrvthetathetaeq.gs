'reinit'

*'open /home/sonny/2km.2010/02.0336/cv.cp/R.020336.ctg.irg.cl.13_140305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/sonny/2km.2010/02.0336/cv.cp/R.020336.ctg.irg.cl.15_160305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/sonny/2km.2010/02.0336/cv.cp/R.020336.ctg.irg.pl.13_140305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/sonny/2km.2010/02.0336/cv.cp/R.020336.ctg.irg.pl.15_160305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/ewerton/Binarios/R.020336.ctg.sl.13_140305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/ewerton/Binarios/R.020336.ctg.sl.15_160305.2km.cv.cp.rcirg70.2.ctl'
*'open /home/ewerton/Binarios/R.020336.dst.cl.13_140305.2km.cv.cp.rcirg70.2.ctl'
'open /home/ewerton/Binarios/R.020336.dst.cl.15_160305.2km.cv.cp.rcirg70.2.ctl'

*nomeexp='ctg.irg.13_140305.2km.cv.cp.9.0S40.6W.1800UTC'
*nomeexp='ctg.irg.pl.cl.15_160305.2km.cv.cp.9.S40.6W.1800UTC'
*nomeexp='ctg.sl.15_160305.2km.cv.cp.9.0S40.6W.1800UTC'
nomeexp='dst.cl.15_160305.2km.cv.cp.9.0S40.6W.1800UTC'


*nomeexp='ctg.irg.13_140305.2km.cv.cp.9.38S40.48W.1200UTC'
*nomeexp='ctg.sl.15_160305.2km.cv.cp.9.38S40.48W.1200UTC'
*nomeexp='dst.cl.15_160305.2km.cv.cp.9.38S40.48W.1200UTC'
*nomeexp='ctg.irg.pl.cl.15_160305.2km.cv.cp.9.38S40.48W.1200UTC'

*Inicializando latitude
*Coordenadas sobre area com mudança antropica
la=-9.
lo=-40.6

*coordenadas da Station information and sounding indices
*la=-9.38
*lo=-40.48


'set lat 'la
'set lon 'lo
oz=1


while (oz<=50)
'set z 'oz
vz=subwrd(result,4)


'set t 13'
'd press'
p1=subwrd(result,4)
'd tempc'
t1=subwrd(result,4)
'd dewptc'
td1=subwrd(result,4)
'd rh'
rh1=subwrd(result,4)
'd rv'
rv1=subwrd(result,4)


'set t 37'
'd press'
p2=subwrd(result,4)
'd tempc'
t2=subwrd(result,4)
'd dewptc'
td2=subwrd(result,4)
'd rv'
rv2=subwrd(result,4)
'd rh'
rh2=subwrd(result,4)

rec=write('sonda.'nomeexp'.txt',vz' 'p1' 't1' 'td1' 'rv1' 'rh1' 'p2' 't2' 'td2' 'rv2' 'rh2)

oz=oz+1
*fim do enquanto t
endwhile






  
