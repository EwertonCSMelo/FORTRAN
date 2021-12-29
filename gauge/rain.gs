'reinit'
'open PRCP_CU_GAUGE_V1.0GLB_0.50deg.lnx.ctl'
'set fwrite le st rain.grd'
'set lat -60 15'
'set lon -90 -30'
'set gxout fwrite'
tt=31
  'set t 1 'tt
  'd rain.1/10.' 
  'disable fwrite'
say "terminou rodada"
'reinit'
