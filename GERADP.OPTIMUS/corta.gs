'reinit'
'sdfopen uwnd.2005.nc'
'sdfopen vwnd.2005.nc'
'sdfopen air.2005.nc'
'sdfopen hgt.2005.nc'
'sdfopen rhum.2005.nc'
'set fwrite mar01_31.grd'
'set gxout fwrite'
'set lat -60 30'
'set lon -120 0'
*((n-1)*4)+1 inicio
*(n*4)+1 termino
tt=237
while (tt <= 360)
  'set t 'tt
* comp u
  zz=1
  while (zz <= 17)
    'set z 'zz
    'd uwnd.1'
    zz=zz+1
  endwhile
* comp v
  zz=1
  while (zz <= 17)
    'set z 'zz
    'd vwnd.2'
    zz=zz+1
  endwhile
* temperatura
  zz=1
  while (zz <= 17)
    'set z 'zz
    'd air.3'
    zz=zz+1
  endwhile
* geopotencial
  zz=1
  while (zz <= 17)
    'set z 'zz
    'd hgt.4'
    zz=zz+1
  endwhile
* umidade do ar
  zz=1
  while (zz <= 8)
    'set z 'zz
    'd rhum.5'
    zz=zz+1
  endwhile
  tt=tt+1
endwhile
'disable fwrite'
say "terminou rodada"
