'reinit'
'open PRCP_CU_GAUGE_V1.0GLB_0.50deg.lnx.ctl'

lat=-9.686180
while(lat<=-7.18618)
lon=-41.5669
while(lon<=-34.0669)
say lat' 'lon
tt=0
while(tt<=11159)
tt=tt+1
*say tt
*'clear'
'set t 'tt
'query time'
tempo=subwrd(result,3)
terceira=substr(tempo,3,1)
if (terceira = 'Z')
hora=substr(tempo,1,2)
minu='00'
dia=substr(tempo,4,2)
mmm=substr(tempo,6,3)
mes=numeros(mmm)
ano=substr(tempo,9,4)
else
hora=substr(tempo,1,2)
minu=substr(tempo,4,2)
dia=substr(tempo,7,2)
mmm=substr(tempo,9,3)
mes=numeros(mmm)
ano=substr(tempo,12,4)
endif
'set lat 'lat
'set lon 'lon
'd prec'
rain=subwrd(result,4)
lixo=write('P1960_1990('lat','lon').txt',ano' 'mes' 'dia' 'rain)
*endwhile
*ano=ano+1
*fim do enquanto ano
endwhile

lon=lon+0.4;*fim do enquanto lon
endwhile

lat=lat+0.4;*fim do enquanto lat
endwhile

function numeros(mmm)
  if (mmm='jan' | mmm='JAN'); mm='01'; endif
  if (mmm='feb' | mmm='FEB'); mm='02'; endif
  if (mmm='mar' | mmm='MAR'); mm='03'; endif
  if (mmm='apr' | mmm='APR'); mm='04'; endif
  if (mmm='may' | mmm='MAY'); mm='05'; endif
  if (mmm='jun' | mmm='JUN'); mm='06'; endif
  if (mmm='jul' | mmm='JUL'); mm='07'; endif
  if (mmm='aug' | mmm='AUG'); mm='08'; endif
  if (mmm='sep' | mmm='SEP'); mm='09'; endif
  if (mmm='oct' | mmm='OCT'); mm='10'; endif
  if (mmm='nov' | mmm='NOV'); mm='11'; endif
  if (mmm='dec' | mmm='DEC'); mm='12'; endif
return (mm)


  


  

