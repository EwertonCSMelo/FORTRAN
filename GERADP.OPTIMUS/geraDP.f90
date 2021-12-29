program geraDP
implicit none
character nomeGRA*100,DIR_dp*80,levs*500,tamC*10
integer nT,nX,nY,nZ,gr,t,irec,i,j,z,ivar,tam,tam_ok,maq,iDIR_dp
real loni,lati,intX,intY,nXr,nYr,nZr
character*17, allocatable :: dp(:)
real, allocatable :: U(:,:,:),V(:,:,:),tempk(:,:,:),geo(:,:,:),UR(:,:,:)

!---- Lendo os Argumentos ----
call getarg(1,nomeGRA)
call getarg(2,tamC)
read(tamC,*) tam
call getarg(3,DIR_dp)
iDIR_dp=index(DIR_dp,' ')-1
!---- Lendo as dimensoes em dims.txt ----
OPEN(25,FILE=DIR_dp(1:iDIR_dp)//"dims.txt",STATUS="old")
read(25,*) nZr, nXr, nYr, loni, lati, intX, intY
read (25,'(a)') levs
read (25,*) nT
allocate (dp(nT))
do i=1,nT
  read(25,'(a17)') dp(i)
enddo
!---- Verificando se o tamanho do Binario estah coerente ----
nX=nint(nXr)
nY=nint(nYr)
nZ=nint(nZr)
allocate (U(nX,nY,nZ),V(nX,nY,nZ),tempk(nX,nY,nZ),geo(nX,nY,nZ),UR(nX,nY,nZ))

maq=4  ! coloque maq=4 caso a maquina for little_endian ou maq=1 caso for big_endian
tam_ok=nX*nY*maq*nT*nZ*5
if (tam_ok.ne.tam) then
  print*,"--> Tamanho do Binario:",tam
  print*,"--> Tamanho que o Binario deveria possuir:",tam_ok
  STOP "O Tamanho do arquivo binario nao estah correto,   Saindo..."
endif

OPEN(1,FILE=nomeGRA,STATUS='unknown' &
      ,FORM='unformatted',ACCESS='direct',RECL=nX*nY*maq)
irec=0
!irec11=0
do t=1,nt
!---- Lendo o arquivo .gra ----
  do ivar=1,5
    z=1
    do z=1,nZ
      irec=irec+1
      if (ivar.eq.1) read(1,rec=irec) ((U(i,j,z), i=1,nX), j=1,nY)
      if (ivar.eq.2) read(1,rec=irec) ((V(i,j,z), i=1,nX), j=1,nY)
      if (ivar.eq.3) read(1,rec=irec) ((tempk(i,j,z), i=1,nX), j=1,nY)
      if (ivar.eq.4) read(1,rec=irec) ((geo(i,j,z), i=1,nX), j=1,nY)
      if (ivar.eq.5) read(1,rec=irec) ((UR(i,j,z), i=1,nX), j=1,nY)
    enddo  !loop do z
  enddo   ! loop do ivar
!---- Escrevendo o Dp do tempo t ----
  open (2,file=DIR_dp(1:iDIR_dp)//dp(t))

  write(2,'(a4,3(1x,a2),3(1x,i4),4(1x,f14.5)') dp(t)(3:6),dp(t)(8:9),dp(t)(11:12),dp(t)(14:15),nZ,nX,  &
         nY,loni,lati,intX,intY
  write (2,'(a)') levs
  z=1
  do z=1,nZ
    do j=1,nY
      do i=1,nX
        if (U(i,j,z).lt.-1e+10) U(i,j,z)=-999.0
        write(2,'(f7.2)') U(i,j,z)
      enddo
    enddo
    do j=1,nY
      do i=1,nX
        if (V(i,j,z).lt.-1e+10) V(i,j,z)=-999.0
        write(2,'(f7.2)') V(i,j,z)
      enddo
    enddo
    do j=1,nY
      do i=1,nX
        if (tempk(i,j,z).lt.-1e+10) tempk(i,j,z)=-999.0
        write(2,'(f7.2)') tempk(i,j,z)
      enddo
    enddo
    do j=1,nY
      do i=1,nX
        if (geo(i,j,z).lt.-1e+10) geo(i,j,z)=-999.0
        write(2,'(f9.2)') geo(i,j,z)
      enddo
    enddo
    do j=1,nY
      do i=1,nX
        if (UR(i,j,z).lt.-1e+10) UR(i,j,z)=-999.0*100
        write(2,'(f8.3)') UR(i,j,z)/100
      enddo
    enddo
  enddo  !loop do z

! ---- ARQUIVOS DE SUPERFICIE ----  

! ---- Lendo o campo de superficie ----
!  irec11=irec11+1
!  read(11,rec=irec11) ((U(i,j,1), i=1,nX), j=1,nY)
!  irec11=irec11+1
!  read(11,rec=irec11) ((V(i,j,1), i=1,nX), j=1,nY)
!  irec11=irec11+1
!  read(11,rec=irec11) ((tempk(i,j,1), i=1,nX), j=1,nY)
!  irec11=irec11+1
!  read(11,rec=irec11) ((geo(i,j,1), i=1,nX), j=1,nY)
!  irec11=irec11+1
!  read(11,rec=irec11) ((UR(i,j,1), i=1,nX), j=1,nY)
!  irec11=irec11+1   ! nao eh necessario ler lo tveg1
!  irec11=irec11+1
!  read(11,rec=irec11) ((tveg2(i,j), i=1,nX), j=1,nY)
!---- Calculando a temperatura media na superficie ----
!  do j=1,nY
!    do i=1,nX
!      tempk(i,j,1)=(tempk(i,j,1)+tveg2(i,j)+273.16)/2
!    enddo
!  enddo
! ---- Escrevendo o campo de superficie ----
  do j=1,nY
    do i=1,nX
      !if (U(i,j,1).lt.-1e+10) U(i,j,1)=-999.0
      write(2,'(f7.2)') -999.0 !U(i,j,1)
    enddo
  enddo
  do j=1,nY
    do i=1,nX
      !if (V(i,j,1).lt.-1e+10) V(i,j,1)=-999.0
      write(2,'(f7.2)') -999.0 ! V(i,j,1)
    enddo
  enddo
  do j=1,nY
    do i=1,nX
      !if (tempk(i,j,1).lt.-1e+10) tempk(i,j,1)=-999.0
      write(2,'(f7.2)') -999.0 ! tempk(i,j,1)
    enddo
  enddo
  do j=1,nY
    do i=1,nX
      !if (geo(i,j,1).lt.-1e+10) geo(i,j,1)=-999.0
      write(2,'(f9.2)') -999.0 ! geo(i,j,1)
    enddo
  enddo
  do j=1,nY
    do i=1,nX
      !if (UR(i,j,1).lt.-1e+10) UR(i,j,1)=-999.0*100
      write(2,'(f8.3)') -999.0 ! UR(i,j,1)/100
    enddo
  enddo
  close (2)
enddo ! loop do tempo
close (1)

print*
end

