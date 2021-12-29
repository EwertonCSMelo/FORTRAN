 program rainbin    
 implicit none
 parameter  ( nx = 720, ny = 360 )   
 character nomeGRA*100,DIR_dp*80,levs*500,tamC*10
 integer nT,nX,nY,nZ,gr,t,irec,i,j,z,ivar,tam,tam_ok,maq,iDIR_dp

maq=4  ! coloque maq=4 caso a maquina for little_endian ou maq=1 caso for big_endian

OPEN(1,FILE=nomeGRA,STATUS='unknown',FORM='unformatted',ACCESS='direct',RECL=nX*nY*maq)

irec=i

do nf=1,nfiles
   OPEN(2,FILE=nomeGRA,STATUS='unknown',FORM='unformatted',ACCESS='direct',RECL=nX*nY*maq)
!---- Lendo o arquivo .gra ----     
      if (ivar.eq.1) then
         read(1,rec=irec) ((rain(i,j), i=1,nX), j=1,nY)
         irecw
      endif
      if (ivar.eq.2) read(1,rec=irec) ((gnum(i,j), i=1,nX), j=1,nY)
!---- Escrevendo o Dp do tempo t ----
      write(1,rec=irecw) ((rain(i,j), i=1,nX), j=1,nY)
      close 2
      irec=irec+1
enddo  !loop do z

Stop
End
     

