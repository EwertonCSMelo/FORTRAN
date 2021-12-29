program convbin

implicit none
real, allocatable, dimension(:) :: pres, geop, temp, torv, ur, dire, velo
real, allocatable, dimension(:) :: uvel, vvel
real, allocatable, dimension(:) :: tpot, pvap, psat, rmis, rsat, tncl, tpeq, tpes
integer              :: n, nmax, ios10=0, ios11
real, parameter      :: indef=-999., pi= 3.1415927
integer, parameter   :: fda=-1
character(len=20)    :: arquivo
logical              :: linux

!INQUIRE(FILE='/etc/passwd',EXIST=linux)

!IF (linux) THEN
!  CALL SYSTEM('ls -1 ?????_??????????') 
!ELSE
!  CALL SYSTEMQQ('dir /w ?????_??????????') 
!END IF

write(*,'(a,$)') 'Entre com o nome da sondagem (ex: 82900_2005042000.txt):'
!read(*,'(a)') arquivo
arquivo='82983_2005030112.txt'
! open (unit= 10, file= 'lista.txt', status= 'old')

!do while (ios10 /= fda)
!  read (10,*, iostat=ios10) arquivo
!  if (ios10 == 0) then
    print*
    print*, '  Gerando o .gra e .ctl para a sondagem: '//arquivo
    open (unit=11, file= arquivo, status= 'old')
    ios11=0
! Leitura inicial só para saber quantas linhas...
    nmax=0
	ios11=0
    do while (ios11 == 0)
      read (11,*,iostat=ios11)
	  nmax=nmax+1
    end do
    nmax=nmax-5
    
    allocate (pres(nmax), geop(nmax), temp(nmax), torv(nmax), ur(nmax), dire(nmax),velo(nmax))
    allocate (uvel(nmax), vvel(nmax))
    rewind (11)
    read (11,*)
	read (11,*)
	read (11,*)
	read (11,*)
    do n=1, nmax
      read (11,*) pres(n), geop(n), temp(n), torv(n), ur(n), dire(n), velo(n)
	!  write(*,*)n,nmax,pres(n), geop(n), temp(n), torv(n), dire(n), velo(n)
    end do
    close (11, status='keep')
! Cálculo do vento zonal e vento meridional
    where (dire /= indef .and. velo /= indef)
       uvel = velo*cos((270.-dire)*pi/180.)
       vvel = velo*sin((270.-dire)*pi/180.)
    elsewhere
       uvel = indef
       vvel = indef
    end where
    deallocate (velo, dire)

! Dimensiono os vetores
    allocate (tpot(nmax), pvap(nmax), psat(nmax), rmis(nmax))
    allocate (rsat(nmax), tncl(nmax), tpeq(nmax), tpes(nmax))

! Cálculo da temperatura potencial equivalente (e de saturação)
    where (temp /= indef .and. pres /= indef .and. torv /= indef)
      psat = 6.112 * exp (17.67 * temp / (temp + 243.5))
      pvap = psat*ur/100.
      rmis = 622. * pvap / (pres - pvap)
      rsat = 622. * psat / (pres - psat)
      tpot = (temp+273.15) * ((1000./pres)**(0.2854*(1-0.28E-3*rmis)))
      tncl = 1/((1/(temp+273.15-55))-(log(ur/100.)/2840.)) + 55.	 
      tpeq = tpot * exp( (3.376/tncl-0.00254)*rmis*(1+0.81E-3*rmis))
      tpes = tpot * exp( 2.625*rsat/(temp+273.15))
    elsewhere
      pvap = indef
      psat = indef
      rmis = indef
      rsat = indef
	  tpot = indef
      tncl = indef
      tpeq = indef
      tpes = indef
    end where
!	write(*,*) psat(1),pvap(1),tncl(1),rsat(1),rmis(1),tpot(1),tpeq(1),tpes(1)
!	read(*,*)
! Libera a memória das variáveis auxiliares
    deallocate(pvap, psat, rsat, tncl)     

! Escrevo o arquivo binário
    arquivo = arquivo(1:16)//'.gra'
    open (unit= 11, file=arquivo, status= 'replace', form= 'unformatted', &
          access= 'direct', recl=4*nmax*9) ! 9 variáveis em nmax níveis
    write (11,rec=1) geop, temp, torv, uvel, vvel, rmis, tpot, tpeq, tpes
    close (11, status= 'keep')
    call geractl(arquivo,nmax,pres,indef)
    
!IF (linux) THEN
    CALL SYSTEM('grads -cpb "run skew9.gs '//arquivo(1:16)//'.ctl '//arquivo(1:5)//' '//arquivo(13:14)//' '// &
                            arquivo(11:12)//' '//arquivo(15:16)//' '//arquivo(7:10)//'"')
!ELSE
!    CALL SYSTEMQQ('grads -cpb "run skew9.gs '//arquivo(1:16)//'.ctl '//arquivo(1:5)//' '//arquivo(13:14)//' '// &
!                            arquivo(11:12)//' '//arquivo(15:16)//' '//arquivo(7:10)//'"')
!END IF
!  elseif (ios10 /= fda) then
!    stop 'Problema no arquivo lista.txt'
!  end if
!end do

!close (10, status= 'keep')

end program convbin


subroutine geractl(arquivo,nmax,pres,indef)
character(len=20), intent(in)     :: arquivo
integer, intent(in)               :: nmax
real, intent(in), dimension(nmax) :: pres
real, intent(in)                  :: indef
integer                           :: omm, ano, mes, dia, hora, n
character(len=3)                  :: month,mmm
character(len=12)                 :: tempo
real                              :: lon=-56.10, lat=-9.87

open (unit=20, file = arquivo(1:16)//'.ctl', status='replace')

read (arquivo, '(i5.5,1x,i4.4,3i2.2)') omm, ano, mes, dia, hora

mmm=month(mes)
write (tempo, '(i2.2,a1,i2.2,a3,i4.4)') hora,'z',dia,mmm,ano

write (20, '(a6,a20)')     'dset ^',arquivo
write (20, '(a6,1x,f7.1)') 'undef ',indef
write (20, '(a18,i5.5)')   'title Sondagem em ',omm
write (20, '(a21)')        'options little_endian'
write (20, '(a14,f7.1)')   'xdef 1 levels ',lon
write (20, '(a14,f7.1)')   'ydef 1 levels ',lat
write (20, '(a5,i5,a8,9999(f7.1,1x))') 'zdef ', nmax, ' levels ',(pres(n), n=1, nmax)
write (20, '(a14,a12,a5)') 'tdef 1 linear ',tempo,' 12hr'
write (20, '(a6)')         'vars 9'
write (20, '(a5,i5,a47)')  'geop ',nmax, ' 99 Altura geopotencial                 [  mgp]'
write (20, '(a5,i5,a47)')  'temp ',nmax, ' 99 Temperatura                         [  mgp]'
write (20, '(a5,i5,a47)')  'torv ',nmax, ' 99 Temperatura de ponto de orvalho     [  mgp]'
write (20, '(a5,i5,a47)')  'uvel ',nmax, ' 99 Componente zonal do vento           [  mgp]'
write (20, '(a5,i5,a47)')  'vvel ',nmax, ' 99 Componente meridional do vento      [  mgp]'
write (20, '(a5,i5,a47)')  'rmis ',nmax, ' 99 Razão de mistura do vapor de água   [  mgp]'
write (20, '(a5,i5,a47)')  'tpot ',nmax, ' 99 Temperatura potencial               [  mgp]'
write (20, '(a5,i5,a47)')  'tpeq ',nmax, ' 99 Temperatura potencial equivalente   [  mgp]'
write (20, '(a5,i5,a47)')  'tpes ',nmax, ' 99 Temp. pot. equivalente de saturação [  mgp]'
write (20, '(a7)')         'endvars'
close (20, status= 'keep')
return
end subroutine geractl


function month(mes)
character(len=3)    :: month
integer, intent(in) :: mes

select case (mes)
  case (1)
    month='jan'
  case (2)
    month='feb'
  case (3)
    month='mar'
  case (4)
    month='apr'
  case (5)
    month='may'
  case (6)
    month='jun'
  case (7)
    month='jul'
  case (8)
    month='aug'
  case (9)
    month='sep'
  case (10)
    month='oct'
  case (11)
    month='nov'
  case (12)
    month='dec'
end select

end function month


!Subrotina dummy para compilacao no linux
subroutine SYSTEMQQ(x)
  CHARACTER :: x
  print*
  print*, '---------------------------------------------------'
  print*, 'Comentar a subrotina SYSTEMQQ para rodar no windows'
  print*, '---------------------------------------------------'
  print*
  stop
return
end

