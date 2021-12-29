
*Inicializando vetor com latitudes
la.1=-9.4
la.2=-11.4

*Inicializando vetor com longitudes
lo.1=-40.5
lo.2=-11.4

nest=1

'reinit'
'open PRCP_CU_GAUGE_V1.0GLB_0.50deg.lnx.ctl'

*numero de estacoes
while(nest<=1)
ano=1979

say la.nest' 'lo.nest
*fazer enquanto ano for menor ou igual ao ultimo ano
'define chuvam=0'
tt=0
while(ano<=1980)
tt=tt+1

'set t 1'
'set lat 'la.nest
'set lon 'lo.nest

'clear'
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

'define chuvam=chuvam+rain/10'


if(mes=2)
if(dia<=28)
'define chuvafev=chuvam'
endif

if(dia=28)
  'define chuvam=0'
endif

if(dia=29)
  'define chuvafev=chuvafev+chuvam'
  chuvam=0
endif
endif

if(mes=3)
if(dia=1)
'd chuvafev'
chuva=subwrd(result,4)
lixo=write('E'la.nest','lo.nest'.txt',ano' '02' 'chuva)
endif
endif


if(mes=1|mes=3|mes=5|mes=7|mes=8|mes=10|mes=12)
if(dia=31)
'd chuvam'
chuva=subwrd(result,4)
lixo=write('E'la.nest','lo.nest'.txt',ano' 'mes' 'chuva)
'define chuvam=0'
endif
endif

if(mes=4|mes=6|mes=9|mes=11)
if(dia=30)
'd chuvam'
chuva=subwrd(result,4)
lixo=write('E'la.nest','lo.nest'.txt',ano' 'mes' 'chuva)
'define chuvam=0'
endif
endif


endwhile;*fim do enquanto ano

nest=nest+1
endwhile;*fim do enquanto nest

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



  
