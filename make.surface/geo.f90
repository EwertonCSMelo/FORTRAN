!modificado em 04 de outubro de 2007
!Ultima modificação 10 de dezembro de 2007
!Programa principal

Program Principal
Integer IDM,JDM,npc,opcao !Numero de pontos de grade em x, y e de contorno
Parameter (npc=3005,npci=6010)
Real ds,lai,las,loi,los,cont(npc,2),cont_mod(npc,2),plo1,pla1,       &
     plo2,pla2,lo1,lo2,la1,la2,cont_int(npci,2),cont_int1(npci,2),res

  Write(*,*)'Por favor aguarde o termino da execucao do programa...'
  Write(*,*)
!Leitura do contorno 
  Write(*,*)'Inicializando configuracao padrao...'
  Write(*,*)
 Call ler(npc,cont,np)	

  Write(*,*)'Escolha o que deseja fazer:'
  Write(*,*)
! Escolhendo tipo de alteracao a ser realizada no ecosistema
  Write(*,*)'Arquivos padrao                                         (0)'
  Write(*,*)'Modificar um tipo de vegetacao em toda area             (1)'
  Write(*,*)'Criar area em formato poligonal                         (2)'
  Write(*,*)'Modificar um tipo de vegetacao de um formato poligonal  (3)'
  Write(*,*)'Assimilar dados SPRING                                  (4)'
  Write(*,*)'Assimilar grade regular                                 (5)'
  read(*,*)opcao
  res=1./120.
!******************************************************************************************
!                        Recolocando a vegeta��o padr�o
!******************************************************************************************
If (opcao==0)then
    call padrao(res)
end if
!******************************************************************************************
!                       Modificar um tipo de vegetacao em toda area
!******************************************************************************************
If (opcao==1)then
    call muda(res) 
end if

!******************************************************************************************
!                       Criar area em formato poligonal 
!******************************************************************************************
If (opcao==2) then 
!Definicao da proporcao de aumento ou diminuicao da area
 Call fat_prop(prop)
!Determinando o aumento ou diminuicao da area
 Write(*,*)'Redimensionando area...'
 Call redimensao(npc,cont,np,prop,cont_mod)
 Write(*,*)'Escrevendo a area desejada em forma de matriz...'
 Write(*,*)
!Interpolando o contorno para ser colocado em forma de matriz
 Call contorn(npc,npci,np,cont_mod,cont_int,npi)
!cont_int1=cont_int
!Gerando matriz com dados
 Call grade(npci,cont_int,npi) 
End if
!******************************************************************************************
!           Modificar um tipo de vegetacao de um formato poligonal  
!******************************************************************************************
If (opcao==3) then 
!Definicao da proporcao de aumento ou diminuicao da area
 Call fat_prop(prop)
!Determinando o aumento ou diminuicao da area
 Write(*,*)'Redimensionando area...'
 Call redimensao(npc,cont,np,prop,cont_mod)
 Write(*,*)'Escrevendo a area desejada em forma de matriz...'
 Write(*,*)
!Interpolando o contorno para ser colocado em forma de matriz
 Call contorn(npc,npci,np,cont_mod,cont_int,npi)
!cont_int1=cont_int
!Gerando matriz com dados
 Call grade2(npci,cont_int,npi) 
End if
!******************************************************************************************
!                                 Assimilar dados SPRING   
!******************************************************************************************

If (opcao==4) then 
!Gerando matriz com dados
 Call grade3(res)
End if
Stop 
End

!Esta subrotina ler os dados do contorno a ser trabalhado
!Desenvolvido por Ewerton C. S Melo em 03/08/2007mks.out  
! e-mail:ecsmelo@yahoo.com
 subroutine ler(npc,cont,np)	   
 Integer npc !Numero de pontos de grade em x, y e de contorno
 Real cont(npc,2)
 Integer ok,np
 Character filein*128
!Leitura do contorno a ser preenchido
!filein='CONTNE.dat'

filein='pb.dat'
Open(10,File=filein,Status='old',Action='read')

ok=0
np=0

!Leitura do contorno a ser preenchido

 Do While(ok.eq.0)
    np=np+1 !Numero de pontos
    read(10,*,End=100,IOSTAT=ok)(cont(np,j),j=1,2)
 End do
100 Continue
 np=np-1

 Return
 End

!
!
!Esta subroutina ler o quanto deseja-se aumentar ou diminuir a area desejada
!
!Desenvolvido por Ewerton C. S. Melo em 03 de agosto de 2007
!Ultima modificacao 22 de outubro de 2007
!                 e-mail: ecsmelo@yahoo.com
!
Subroutine fat_prop(prop)
 Real fator,prop
 Integer opcao
 Character*10 opcao_tipo(2)

Write(*,*)'Digite 1 (aumentar) ou 2 (diminuir) pressione<Enter>' 

!Definindo escolha aumentar ou diminuir
  Read(*,*)opcao
!opcao=2

!Definindo fator de aumento ou reducao
 Write(*,*)'Digite proporcao de aumento ou reducao (%)'
 read(*,*)fator
 !fator=.75

 opcao_tipo(1)='aumentada em'
 opcao_tipo(2)='reduzida em'

If (fator.gt.1)fator=fator/100.

If (opcao.eq.1) then
   Write(*,10)opcao_tipo(opcao),fator*100
   prop=1+fator
End If

If (opcao.eq.2) then
   Write(*,10)opcao_tipo(opcao),fator*100   
   prop=1-fator
End If

10 Format('A area desejada sera ',A9,' em ',F5.1,'%')

Return
End


!Subrotina que redimensiona a area 20/07/2007
Subroutine redimensao(npc,cont,np,prop,cont_mod)
Integer	npc
Integer	np,npts
Real cont(npc,2),cont_mod(npc,2),latc,lonc,prop,prop2

npts=np


 call centro(npc,cont,np,latc,lonc)

! Redimencionando a área
prop2=prop
Do i=1,np 
  prop=prop2
  cont_mod(i,1)=(cont(i,1)-(1-sqrt(1.0/prop))*lonc)/sqrt(1.0/prop)
  prop=prop2
  cont_mod(i,2)=(cont(i,2)-(1-sqrt(1.0/prop))*latc)/sqrt(1.0/prop)
  !write(100,105)(cont_mod(i,j),j=1,2)
End do
Return 
End

 !Esta função substitui um tipo de vegetação por outro
Subroutine padrao(res)
 Integer nx,ny
 Parameter(nx=2404,ny=2404,nc=21)
 Real ds,plo,pla,res,x0,y0,latc,lonc,e,w,n,s
 integer*2 iveg(nx,ny),sfc(nx,ny),classe_olson(nc)
 Integer ok,classe,ic,dentro,saiu,fim,     &
        imax,imin,jmax,jmin,i1,j1,i2,j2,lai,las,loi,los,viz,valor
 Character*40 classe_nome(nc)
 Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/ 

!      write(*,*)'Lendo arquivo de uso de solo'
!-----          
      open(15,file='NE_GE20S05S55W40W.ASC',status='old',action='read')
 
      do j=ny,1,-1
       do i=1,nx
         read(15,*) iveg(i,j)	   
       enddo
       if (mod(j,100).eq.0) write(*,*) 'Lendo linha=> ',j
      enddo
     close(15)
 
sfc=iveg 

!Gerando arquivos a serem utilizados no BRAMS
 
 Write(*,*)'Gerando arquivos a serem utilizados no BRAMS...'
 Write(*,*)
  Call mkveg(sfc)
Return
End


 !Esta função substitui um tipo de vegetação por outro
Subroutine muda(res)
 Parameter(nx=2404,ny=2404,nc=21)
 Real ds,plo,pla,res,x0,y0,latc,lonc,e,w,n,s
 integer*2 iveg(nx,ny),sfc(nx,ny),classe_olson(nc),classe
 Integer ok,ic,dentro,saiu,fim,imax,imin,jmax,jmin,i1, &
         j1,i2,j2,lai,las,loi,los,viz,valor
 Character*40 classe_nome(nc)
 Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/ 

!write(*,*)'*************definindo classe**********************'
!********Solicitando o tipo de classe******************
 write(*,*)'Tipos de classes:'
 write(*,*)
 write(*,*)'0  Ocean'
 write(*,*)'1  Lakes, rivers, streams'
 write(*,*)'2  Ice cap/glacier'
 write(*,*)'3  Desert, bare soil'	
 write(*,*)'4  Evergreen needleleaf tree'
 write(*,*)'5  Deciduous needleleaf tree'
 write(*,*)'6  Deciduous broadleaf tree'
 write(*,*)'7  Evergreen broadleaf tree'
 write(*,*)'8  Short grass'
 write(*,*)'9  Tall grass'
 write(*,*)'10 Semi-desert'
 write(*,*)'11 Tundra'
 write(*,*)'12 Evergreen shrub'
 write(*,*)'13 Deciduous shrub'
 write(*,*)'14 Mixed woodland'
 write(*,*)'15 Crop/mixed farming, C3 grassland	'
 write(*,*)'16 Irrigated crop'
 write(*,*)'17 Bog or marsh'
 write(*,*)'18 Wooded grassland'
 write(*,*)'19 Urban and built up'	
 write(*,*)'20 Wetland evergreen broadleaf tree'
 write(*,*)
 write(*,*)
 write(*,*)'Por favor digite qual classe desejada:'
 read(*,*)classe
!armazenando rotulo das classe segundo classificao OLSON(1993)

 classe=classe_olson(classe+1)

!Preenchendo area com vegetaçao desejada

!****************************************************************************

  lai=-20     !
  las=-05      !Extremos da grade a ser criada n,s,o,e
  loi=-55    !
  los=-40       !
!      write(*,*)'Lendo arquivo de uso de solo'
!-----          
      open(15,file='NE_GE20S05S55W40W.ASC',status='old',action='read')
 
      do j=ny,1,-1
       do i=1,nx
         read(15,*) iveg(i,j)	   
       enddo
       if (mod(j,100).eq.0) write(*,*) 'Lendo linha=> ',j
      enddo
     close(15)
 
!     OPEN(30,STATUS='UNKNOWN',FILE='mkne.dat',FORM='UNFORMATTED',RECL=nx*ny*4)
!            read(30)iveg


sfc=iveg 
!Preenchendo a matriz com o bioma da caatinga apenas a area desejada
!Encont_modrando a equivalencia entre coordenadas e posicao da matriz
!Calculo do espaçamento da grade em graus

!Cada arquivo individual de vegetacao do RAMS tem 5 ou 10 graus em que 1 grau equivale a 120pts
res=1.0/120.0 !Calculo da resolução em graus dos arquivos

 check=0
  
!Reposicionando area

!Inicialização das variaveis
e=-180.0
w=180.0
n=-90.0
s=90.0

!Modificando superficie de arbustos temporarios para deserto
!  Do j=ny,1,-1
!    Do i=1,nx      
!       If(sfc(i,j).eq.17.or.sfc(i,j).eq.59) then  !Caso arbustos temporarios        
!         sfc(i,j)=classe
!      End if
!    End do
!  End do

!Modificando superficie arbustos temporarios e culturas para deserto
  Do j=ny,1,-1
    Do i=1,nx
      If(sfc(i,j).eq.17.or.sfc(i,j).eq.59.or.                   &  !Caso arbustos temporarios
         sfc(i,j).eq.30.or.sfc(i,j).eq.31.or.sfc(i,j).eq.35.or. &  !Caso culturas
         sfc(i,j).eq.92.or.sfc(i,j).eq.93.or.sfc(i,j).eq.94)then
         sfc(i,j)=classe
      End if
    End do
  End do

 open (1,file='area.inf',status='unknown')
  
     write(1,*)'substituindo todas vegetacao de um tipo por ',classe
 
  close (1)

!Gerando arquivos a serem utilizados no BRAMS
 
 Write(*,*)'Gerando arquivos a serem utilizados no BRAMS...'
 Write(*,*)
  Call mkveg(sfc)
Return
End
!Subrotina responsavel por inserir a forma poligonal na area em estudo
Subroutine grade(npci,cont_int,npi)
 Parameter(nx=2404,ny=2404,nc=21)
 Integer npci,npi !Numero de pontos de grade em x, y e de cont_modorno
 Real ds,cont_int(npci,2),cont_d(npci,2),plo,pla,res,x0,y0,latc,lonc, &
     e,w,n,s
 integer*2 iveg(nx,ny),sfc(nx,ny),classe_olson(nc)
 Integer ok,check(npi),classe,Coord_ij(npi,2),ic,dentro,saiu,fim,     &
        imax,imin,jmax,jmin,i1,j1,i2,j2,lai,las,loi,los,viz,valor
 Character*40 classe_nome(nc)
  Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/ 

!write(*,*)'*************definindo classe**********************'
!********Solicitando o tipo de classe******************
 write(*,*)'Tipos de classes:'
 write(*,*)
 write(*,*)'0  Ocean'
 write(*,*)'1  Lakes, rivers, streams'
 write(*,*)'2  Ice cap/glacier'
 write(*,*)'3  Desert, bare soil'	
 write(*,*)'4  Evergreen needleleaf tree'
 write(*,*)'5  Deciduous needleleaf tree'
 write(*,*)'6  Deciduous broadleaf tree'
 write(*,*)'7  Evergreen broadleaf tree'
 write(*,*)'8  Short grass'
 write(*,*)'9  Tall grass'
 write(*,*)'10 Semi-desert'
 write(*,*)'11 Tundra'
 write(*,*)'12 Evergreen shrub'
 write(*,*)'13 Deciduous shrub'
 write(*,*)'14 Mixed woodland'
 write(*,*)'15 Crop/mixed farming, C3 grassland	'
 write(*,*)'16 Irrigated crop'
 write(*,*)'17 Bog or marsh'
 write(*,*)'18 Wooded grassland'
 write(*,*)'19 Urban and built up'	
 write(*,*)'20 Wetland evergreen broadleaf tree'
 write(*,*)
 write(*,*)
 write(*,*)'Por favor digite qual classe desejada:'
 read(*,*)classe
!armazenando rotulo das classe segundo classificação OLSON(1993)

 classe=classe_olson(classe+1)

!Preenchendo area com vegetaçao desejada

!****************************************************************************

  lai=-20     !
  las=-05      !Extremos da grade a ser criada n,s,o,e
  loi=-55    !
  los=-40       !
!      write(*,*)'Lendo arquivo de uso de solo'
!-----          
      open(15,file='NE_GE20S05S55W40W.ASC',status='old',action='read')
 
      do j=ny,1,-1
       do i=1,nx
         read(15,*) iveg(i,j)	   
       enddo
       if (mod(j,100).eq.0) write(*,*) 'Lendo linha=> ',j
      enddo
     close(15)
 
!     OPEN(30,STATUS='UNKNOWN',FILE='mkne.dat',FORM='UNFORMATTED',RECL=nx*ny*4)
!            read(30)iveg


sfc=iveg 
!Preenchendo a matriz com o bioma da caatinga apenas a area desejada
!Encont_modrando a equivalencia entre coordenadas e posicao da matriz
!Calculo do espaçamento da grade em graus

!Cada arquivo individual de vegetacao do RAMS tem 5 ou 10 graus em que 1 grau equivale a 120pts
res=1.0/120.0 !Calculo da resolução em graus dos arquivos

 check=0
  
!Reposicionando area

!Inicialização das variaveis
e=-180.0
w=180.0
n=-90.0
s=90.0

!Determinando extremos do contorno
Do ic=1,npi   !Determinando centro da area original
   If(cont_int(ic,1).gt.e)e=cont_int(ic,1)
   If(cont_int(ic,1).lt.w)w=cont_int(ic,1)
   If(cont_int(ic,2).gt.n)n=cont_int(ic,2)
   If(cont_int(ic,2).lt.s)s=cont_int(ic,2)  
End do

lonc=(e+w)/2.0
latc=(n+s)/2.0

!Centro da nova localidade
x0=-40.5  !Para petrolina
y0=-9.4

Do ic=1,npi  !Mudando o centro
    cont_int(ic,1)=cont_int(ic,1)-(lonc-x0)    
    cont_int(ic,2)=cont_int(ic,2)-(latc-y0)
End do


!Convertendo coordenadas latitude e longitude em coordenadas i, j da matriz

 Do ic=1,npi
    plo=abs((abs(loi)-abs(cont_int(ic,1)))/res)
    pla=abs((abs(lai)-abs(cont_int(ic,2)))/res)
    cont_int(ic,1)=int(plo)+1
    cont_int(ic,2)=int(pla)+1
 End do
 
 Do ic=1,npi
    Coord_ij(ic,1)=int(cont_int(ic,1))
    Coord_ij(ic,2)=int(cont_int(ic,2))
 End do

 !Definindo pontos extremos

   imax=-1
   imin=1000000
   jmax=-1
   jmin=1000000

   Do i=1,npi
	  If (Coord_ij(i,1).gt.imax)imax=Coord_ij(i,1)
	  If (Coord_ij(i,1).lt.imin)imin=Coord_ij(i,1)
	  If (Coord_ij(i,2).gt.jmax)jmax=Coord_ij(i,2)
	  If (Coord_ij(i,2).lt.jmin)jmin=Coord_ij(i,2)
   End do

 !ponto central
  imed=(imax+imin)/2
  jmed=(jmax+jmin)/2
 
!Modificando superficie
 Do j=jmax,jmin-1,-1
    Do i=imin,imax
      If(sfc(i,j).ne.14.and.sfc(i,j).ne.15.and.sfc(i,j).ne.83.and. &
         sfc(i,j).ne.24.and.sfc(i,j).ne.25.and.sfc(i,j).ne.76.and. &
         sfc(i,j).ne.77.and.sfc(i,j).ne.78)sfc(i,j)=classe
    End do
 End do


 open (1,file='area.inf',status='unknown')
  
     write(1,11)imax-imin+1,jmax-jmin+1
  11 Format(2I7) 
     write(1,12)classe
  12 Format('res: 1km  classe= ',I2) 
 
  Do i=imin,imax
     Write(1,2)(sfc(i,j),j=jmin,jmax)
  End do					  

2 Format (336I3)
  close (1)

!Gerando arquivos a serem utilizados no BRAMS
 
 Write(*,*)'Gerando arquivos a serem utilizados no BRAMS...'
 Write(*,*)
  Call mkveg(sfc)
Return
End
!Subrotina responsavel por inserir a forma poligonal na area em estudo
 Subroutine grade2(npci,cont_int,npi)
 Parameter(nx=2404,ny=2404,nc=21)
 Integer npci,npi !Numero de pontos de grade em x, y e de cont_modorno
 Real ds,cont_int(npci,2),cont_d(npci,2),plo,pla,res,x0,y0,latc,lonc, &
     e,w,n,s
 integer*2 iveg(nx,ny),sfc(nx,ny),classe_olson(nc)
 Integer ok,check(npi),classe,Coord_ij(npi,2),ic,dentro,saiu,fim,     &
        imax,imin,jmax,jmin,i1,j1,i2,j2,lai,las,loi,los,viz,valor
 Character*40 classe_nome(nc)
  Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/  

!write(*,*)'*************definindo classe**********************'
!********Solicitando o tipo de classe******************
 write(*,*)'Tipos de classes:'
 write(*,*)
 write(*,*)'0  Ocean'
 write(*,*)'1  Lakes, rivers, streams'
 write(*,*)'2  Ice cap/glacier'
 write(*,*)'3  Desert, bare soil'	
 write(*,*)'4  Evergreen needleleaf tree'
 write(*,*)'5  Deciduous needleleaf tree'
 write(*,*)'6  Deciduous broadleaf tree'
 write(*,*)'7  Evergreen broadleaf tree'
 write(*,*)'8  Short grass'
 write(*,*)'9  Tall grass'
 write(*,*)'10 Semi-desert'
 write(*,*)'11 Tundra'
 write(*,*)'12 Evergreen shrub'
 write(*,*)'13 Deciduous shrub'
 write(*,*)'14 Mixed woodland'
 write(*,*)'15 Crop/mixed farming, C3 grassland	'
 write(*,*)'16 Irrigated crop'
 write(*,*)'17 Bog or marsh'
 write(*,*)'18 Wooded grassland'
 write(*,*)'19 Urban and built up'	
 write(*,*)'20 Wetland evergreen broadleaf tree'
 write(*,*)
 write(*,*)
 write(*,*)'Por favor digite qual classe desejada:'
 read(*,*)classe
!armazenando rotulo das classe segundo classificação OLSON(1993)

 classe=classe_olson(classe+1)

!Preenchendo area com vegetaçao desejada

!****************************************************************************

  lai=-20     !
  las=-05      !Extremos da grade a ser criada n,s,o,e
  loi=-55    !
  los=-40       !
!      write(*,*)'Lendo arquivo de uso de solo'
!-----          
      open(15,file='NE_GE20S05S55W40W.ASC',status='old',action='read')
 
      do j=ny,1,-1
       do i=1,nx
         read(15,*) iveg(i,j)	   
       enddo
       if (mod(j,100).eq.0) write(*,*) 'Lendo linha=> ',j
      enddo
     close(15)
 
!     OPEN(30,STATUS='UNKNOWN',FILE='mkne.dat',FORM='UNFORMATTED',RECL=nx*ny*4)
!            read(30)iveg


sfc=iveg 
!Preenchendo a matriz com o bioma da caatinga apenas a area desejada
!Encont_modrando a equivalencia entre coordenadas e posicao da matriz
!Calculo do espaçamento da grade em graus

!Cada arquivo individual de vegetacao do RAMS tem 5 ou 10 graus em que 1 grau equivale a 120pts
res=1.0/120.0 !Calculo da resolução em graus dos arquivos

 check=0
  
!Reposicionando area

!Inicialização das variaveis
e=-180.0
w=180.0
n=-90.0
s=90.0

!Determinando extremos do contorno
Do ic=1,npi   !Determinando centro da area original
   If(cont_int(ic,1).gt.e)e=cont_int(ic,1)
   If(cont_int(ic,1).lt.w)w=cont_int(ic,1)
   If(cont_int(ic,2).gt.n)n=cont_int(ic,2)
   If(cont_int(ic,2).lt.s)s=cont_int(ic,2)  
End do

lonc=(e+w)/2.0
latc=(n+s)/2.0

!Centro da nova localidade
x0=-40.5  !Para petrolina
y0=-9.4

Do ic=1,npi  !Mudando o centro
    cont_int(ic,1)=cont_int(ic,1)-(lonc-x0)    
    cont_int(ic,2)=cont_int(ic,2)-(latc-y0)
End do


!Convertendo coordenadas latitude e longitude em coordenadas i, j da matriz

 Do ic=1,npi
    plo=abs((abs(loi)-abs(cont_int(ic,1)))/res)
    pla=abs((abs(lai)-abs(cont_int(ic,2)))/res)
    cont_int(ic,1)=int(plo)+1
    cont_int(ic,2)=int(pla)+1
 End do
 
 Do ic=1,npi
    Coord_ij(ic,1)=int(cont_int(ic,1))
    Coord_ij(ic,2)=int(cont_int(ic,2))
 End do

 !Definindo pontos extremos

   imax=-1
   imin=1000000
   jmax=-1
   jmin=1000000

   Do i=1,npi
	  If (Coord_ij(i,1).gt.imax)imax=Coord_ij(i,1)
	  If (Coord_ij(i,1).lt.imin)imin=Coord_ij(i,1)
	  If (Coord_ij(i,2).gt.jmax)jmax=Coord_ij(i,2)
	  If (Coord_ij(i,2).lt.jmin)jmin=Coord_ij(i,2)
   End do

 !ponto central
  imed=(imax+imin)/2
  jmed=(jmax+jmin)/2

!Modificando superficie de arbustos temporarios para deserto
  Do j=jmax,jmin-1,-1
    Do i=imin,imax
      If(sfc(i,j).eq.17.or.sfc(i,j).eq.59) then  !Caso arbustos temporarios        
         sfc(i,j)=classe
      End if
    End do
  End do

!Modificando superficie arbustos temporarios e culturas para deserto
  Do j=jmax,jmin-1,-1
    Do i=imin,imax
      If(sfc(i,j).eq.17.or.sfc(i,j).eq.59.or.                   &  !Caso arbustos temporarios
         sfc(i,j).eq.30.or.sfc(i,j).eq.31.or.sfc(i,j).eq.35.or. &  !Caso culturas
         sfc(i,j).eq.92.or.sfc(i,j).eq.93.or.sfc(i,j).eq.94)then
         sfc(i,j)=classe
      End if
    End do
  End do

 open (1,file='area.inf',status='unknown')
  
     write(1,11)imax-imin+1,jmax-jmin+1
  11 Format(2I7) 
     write(1,12)classe
  12 Format('res: 1km  classe= ',I2) 
 
  Do i=imin,imax
     Write(1,2)(sfc(i,j),j=jmin,jmax)
  End do					  

2 Format (336I3)
  close (1)

!Gerando arquivos a serem utilizados no BRAMS
 
  Write(*,*)'Gerando arquivos a serem utilizados no BRAMS...'
  Write(*,*)
  Call mkveg(sfc)
Return
End

!Subrotina responsavel por assimilar dados do spring
Subroutine grade3(res)
 Parameter(nx=2404,ny=2404,nc=21,nxgrd=110,nygrd=111)
 Real ds,plo,pla,res,x0,y0,latc,lonc,e,w,n,s
 integer*2 iveg(nx,ny),sfc(nx,ny),classe_olson(nc),sfc_km(nxgrd,nygrd)
 Integer ok,classe,ic,dentro,saiu,fim,imax,imin,jmax,jmin,i1,j1,i2,j2, &
         lai,las,loi,los,viz,valor,ni,nj,ig,jg
 Character*40 classe_nome(nc)
  Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/  

!write(*,*)'*************definindo classe**********************'
!********Solicitando o tipo de classe******************
! write(*,*)'Tipos de classes:'
! write(*,*)
! write(*,*)'0  Ocean'
! write(*,*)'1  Lakes, rivers, streams'
! write(*,*)'2  Ice cap/glacier'
! write(*,*)'3  Desert, bare soil'	
! write(*,*)'4  Evergreen needleleaf tree'
! write(*,*)'5  Deciduous needleleaf tree'
! write(*,*)'6  Deciduous broadleaf tree'
! write(*,*)'7  Evergreen broadleaf tree'
! write(*,*)'8  Short grass'
! write(*,*)'9  Tall grass'
! write(*,*)'10 Semi-desert'
! write(*,*)'11 Tundra'
! write(*,*)'12 Evergreen shrub'
! write(*,*)'13 Deciduous shrub'
! write(*,*)'14 Mixed woodland'
! write(*,*)'15 Crop/mixed farming, C3 grassland	'
! write(*,*)'16 Irrigated crop'
! write(*,*)'17 Bog or marsh'
! write(*,*)'18 Wooded grassland'
! write(*,*)'19 Urban and built up'	
! write(*,*)'20 Wetland evergreen broadleaf tree'
! write(*,*)
! write(*,*)
! write(*,*)'Por favor digite qual classe desejada:'
! read(*,*)classe
!armazenando rotulo das classe segundo classificação OLSON(1993)

 classe=classe_olson(classe+1)

!Preenchendo area com vegetaçao desejada

!****************************************************************************

  lai=-20     !
  las=-05      !Extremos da grade a ser criada n,s,o,e
  loi=-55    !
  los=-40       !
!      write(*,*)'Lendo arquivo de uso de solo'
!-----          
      open(15,file='NE_GE20S05S55W40W.ASC',status='old',action='read')
 
      do j=ny,1,-1
       do i=1,nx
         read(15,*) iveg(i,j)	   
       enddo
       if (mod(j,100).eq.0) write(*,*) 'Lendo linha=> ',j
      enddo
     close(15)
 
!     OPEN(30,STATUS='UNKNOWN',FILE='mkne.dat',FORM='UNFORMATTED',RECL=nx*ny*4)
!            read(30)iveg


sfc=iveg 

!Abrindo arquivo SPRING
     Call ler_spr(w,e,s,n,sfc_km)

!Preenchendo a matriz com o bioma da caatinga apenas a area desejada
!Encont_modrando a equivalencia entre coordenadas e posicao da matriz
!Calculo do espaçamento da grade em graus

!Cada arquivo individual de vegetacao do RAMS tem 5 ou 10 graus em que 1 grau equivale a 120pts
res=1.0/120.0 !Calculo da resolução em graus dos arquivos

 check=0


!Convertendo coordenadas latitude e longitude em coordenadas i, j da matriz

    imax=abs((abs(loi)-abs(e))/res)-6
    imin=abs((abs(loi)-abs(w))/res)+5
    jmax=abs((abs(lai)-abs(n))/res)-5
    jmin=abs((abs(lai)-abs(s))/res)+5
	ni=imax-imin+1
	nj=jmax-jmin+1
 !ponto central
  imed=(imax+imin)/2
  jmed=(jmax+jmin)/2

 
!Modificando superficie
  jg=nj
 
  Do j=jmax,jmin-1,-1
        ig=1	  
     Do i=imin,imax
        If(sfc_km(ig,jg).ne.-1)sfc(i,j)=sfc_km(ig,jg)
        ig=ig+1
     End do
	jg=jg-1
  End do

 open (1,file='area.inf',status='unknown')
  
     write(1,11)imax-imin+1,jmax-jmin+1
  11 Format(2I7) 
     write(1,12)classe
  12 Format('res: 1km  classe= ',I2) 
 
  Do i=imin,imax
     Write(1,2)(sfc(i,j),j=jmin,jmax)
  End do					  

2 Format (336I3)
  close (1)

!Gerando arquivos a serem utilizados no BRAMS
 
 Write(*,*)'Gerando arquivos a serem utilizados no BRAMS...'
 Write(*,*)
  Call mkveg(sfc)
Return
End
!Subrotina que determina o centro da regiao	 20/07/2007

Subroutine centro(npc,cont,np,latc,lonc)
Integer np,npc
Real cont(npc,2),l,o,n,s,latc,lonc

!Inicialização das variaveis
l=-180.0
o=180.0
n=-90.0
s=90.0

!Determinando extremos do contorno
Do i=1,np
   If(cont(i,1).gt.l)l=cont(i,1)
   If(cont(i,1).lt.o)o=cont(i,1)
   If(cont(i,2).gt.n)n=cont(i,2)
   If(cont(i,2).lt.s)s=cont(i,2)   
End do
lonc=(l+o)/2.0
latc=(n+s)/2.0
Return 
End

 !
 !
 !	Esta subrotina foi desenvolvida com o proposito de gerar os pontos do contorno de acordo com a resoluçao 
 !      dos dados superfíciais a serem modificados 
 !      Ewerton Cleudson de Sousa Melo 04/12/2007
 !
 !------------------------------------------------------------------------------
Subroutine contorn(npc,npci,np,cont1,cont_int,npi)
 Parameter (m=4)
 Integer npc,np,npci,npi,ok !Numero de pontos de grade em x, y e de contorno
 Real res,xi,cont1(npc,2),cont_int(npci,2),cont_int2(npci,2),f(m),x(m),plo,pla,loi,lai,las,los
 Dimension ij(npc,2)

!Inicializacao das variaveis
res=1./120.
i=1
k=1

lai=-60       !
las=60        !Extremos da grade a ser criada n,s,o,e
loi=-180        !
los=0        !


	Do i=1,np
	  	ok=0
		!cont_int(k,1)=cont_mod(i,1)
		!cont_int(k,2)=cont_mod(i,2)
	   If (i.eq.1) then
		  cont_int(k,1)=cont1(i,1)
		  cont_int(k,2)=cont1(i,2)
	   End if
	
 !***********************************************************************************
 !                               Interpolando longitude
 !***********************************************************************************
	

	If(abs(cont1(i,1)-cont1(i+1,1)).gt.res.and.i.ne.np) then
		! xi=ij(i,1)!inicializando as variaveis
		 xi=cont1(i,1)
		 cont_int(k,1)=xi
	  !write(*,*)cont1(i,1),cont1(i+1,1),cont_int(k,1),cont1(i+1,1),abs(cont_int(k,1)-cont1(i+1,1))/res
	  !read(*,*)
      Do while(abs(cont_int(k,1)-cont1(i+1,1)).gt.res)
	  !Do while(abs(cont_int(k,1)-cont1(i+1,1)).ne.0)
   
	     k=k+1
		 
		 If	(cont1(i,1).gt.cont1(i+1,1)) then
		    sinal=-1
		 Else
		    sinal=1
		 End If
		 
		 xi=xi+sinal*res
		 ! xi=xi+sinal
		 !write(*,*)sinal,xi
		 cont_int(k,1)=xi

	     !Caso no inicio do vetor
         If (i.eq.1) then
		  x(1)=cont1(np-1,1)
		  x(2)=cont1(i,1)   
		  x(3)=cont1(i+1,1) 
		  x(4)=cont1(i+2,1) 

		  f(1)=cont1(np-1,2)
		  f(2)=cont1(i,2)   
		  f(3)=cont1(i+1,2) 
		  f(4)=cont1(i+2,2) 
	     End If

	     !Caso no intermediario do vetor
	     If (i.gt.1.and.i.lt.(np-1)) then
		  x(1)=cont1(i-1,1)
		  x(2)=cont1(i,1)
		  x(3)=cont1(i+1,1)
		  x(4)=cont1(i+2,1)

		  f(1)=cont1(i-1,2)
		  f(2)=cont1(i,2)
		  f(3)=cont1(i+1,2)
		  f(4)=cont1(i+2,2)
	     End If

	     !Caso no fim do vetor
	     If (i.eq.(np-1)) then

		    x(1)=cont1(i-1,1)
		    x(2)=cont1(i,1)
		    x(3)=cont1(1,1)
		    x(4)=cont1(2,1)

  		    f(1)=cont1(i-1,2)
		    f(2)=cont1(i,2)
		    f(3)=cont1(1,2)
		    f(4)=cont1(2,2)
	     End If

	     Call cubo(f,x,xi,pn)   !Chamada da interpolação cubica
		 !cont_int(k,2)=int(pn)
		 cont_int(k,2)=pn

	  	!write(*,*)i,'y',k,cont_int(k,1),cont_int(k,2),cont1(i+1,1)
	  
	  End do
	     ok=1
	
	
	End If


 !***********************************************************************************
 !                               Interpolando latitude
 !***********************************************************************************
 	 If(abs(cont1(i,2)-cont1(i+1,2)).gt.res) then

		! xi=cont1(i,2)            !inicializando as variaveis
		 xi=cont1(i,2)
		 cont_int(k,2)=cont1(i,2)
	  !write(*,*)cont1(i,2),cont1(i+1,2),cont_int(k,2),cont1(i+1,2),abs(cont_int(k,2)-cont1(i+1,2))/res
	  !read(*,*)

      Do while(abs(cont_int(k,2)-cont1(i+1,2)).gt.res.and.i.ne.np)
	     k=k+1
		 !Determinando acrescimo ou decrescimo
		 If	(cont1(i,2).gt.cont1(i+1,2)) then
		    sinal=-1
		 Else
		    sinal=1
		 End If
		 
		 xi=xi+sinal*res
		! xi=xi+sinal

		 cont_int(k,2)=xi

	     !Caso no inicio do vetor
         If (i.eq.1) then
		  x(1)=cont1(np-1,2)
		  x(2)=cont1(i,2)   
		  x(3)=cont1(i+1,2) 
		  x(4)=cont1(i+2,2) 

		  f(1)=cont1(np-1,1)
		  f(2)=cont1(i,1)   
		  f(3)=cont1(i+1,1) 
		  f(4)=cont1(i+2,1) 
	     End If

	     !Caso no intermediario do vetor
	     If (i.gt.1.and.i.lt.(np-1)) then
		  x(1)=cont1(i-1,2)
		  x(2)=cont1(i,2)
		  x(3)=cont1(i+1,2)
		  x(4)=cont1(i+2,2)

		  f(1)=cont1(i-1,1)
		  f(2)=cont1(i,1)
		  f(3)=cont1(i+1,1)
		  f(4)=cont1(i+2,1)
	     End If

	     !Caso no fim do vetor 
	     If (i.eq.(np-1)) then
		    x(1)=cont1(i-1,2)
		    x(2)=cont1(i,2)
		    x(3)=cont1(1,2)
		    x(4)=cont1(2,2)

  		    f(1)=cont1(i-1,1)
		    f(2)=cont1(i,1)
		    f(3)=cont1(1,1)
		    f(4)=cont1(2,1)
	     End If

	     Call cubo(f,x,xi,pn)		!Chamada da interpolação cubica

		 !cont_int(k,1)=int(pn)
		 cont_int(k,1)=pn

		!write(*,*)i,'x',k,cont_int(k,1),cont_int(k,2),cont1(i+1,1)

	  End do
	  
	End If
	
	If(abs(cont_int(k,1)-cont1(i+1,1)).le.res.and.abs(cont_int(k,2)-cont1(i+1,2)).le.res)then
	  k=k+1
	  cont_int(k,1)=cont1(i,1)
	  cont_int(k,2)=cont1(i,2)
	End if
 

   End do
   npi=k


Return
End

!Este programa tem como objetivo realizar a interpolação em varios graus
!Se ordem igual a 1 entao é linear
!Criado por Ewerton   05 de agosto de 2007
!Ultima data de modificação  22 de junho de 2007
Subroutine cubo(f,x,xi,Pn)
Integer m
Parameter (m=4)
Real f(m),x(m),xi,dfx(m),prod,Pn
Integer n,nf

n=3 !ordem da interpolaçao 

!Diferença de ordem n considere n igual 1 ordem 0

  dfx=0.0
  Do i=1,(n+1)
      Do k=1,i
	    prod=1.0 !valor inicial do produtorio
		Do j=1,i	
          If(j.ne.k)prod=prod*(x(k)-x(j)) !Calculo do produtorio  
		  If(prod.eq.0)prod=10E-25
        End do 
        dfx(i)=dfx(i)+f(k)/prod  !Calculo do somatorio
	 End do 
   End do


! Polinomio de interpolação

Pn=0
 
  Do i=1,(n+1)
     prod=1
	 If (i.ne.1) then
	    nf=(i+1-2)
	    Do j=1,nf
		   prod=prod*(xi-x(j))
        End do
     End if
	 Pn=Pn+prod*dfx(i)
  End do

  !Interpolação linear
  If ((Pn.gt.f(2).and.Pn.gt.f(3)).or.(Pn.lt.f(2).and.Pn.lt.f(3))) then
   Pn=((f(3)-f(2))*(xi-x(2)))/(x(3)-x(2))+f(2)
  End if	

Return
End


 Subroutine ler_spr(x1,x2,y1,y2,sfc_km)
    Parameter (lkm=1000.0,nxgrd=110,nygrd=111,nc=21)
    Integer g,m,s,ncols,nli,ns,x1g,x1m,y1g,y1m,x2g,x2m,y2g,y2m,sfc_m(nxgrd,nygrd), &
            sfc_km(nxgrd,nygrd),m_kmx,m_kmy,nptsx,nptsy,np
    Real    x1,x2,y1,y2,x1s,y1s,x2s,y2s,resX,resY
    Character*256 arq_ent,linha
	Integer*2 classe_olson(nc)
	 Data classe_olson/15,14,12,8,3,4,5,6,2,7,11,9,16,17,18,30,10,13,19,1,72/  
    ! 1 Agua
    ! 2 Area Irrigada
    ! 3 Caatinga
    ! 4 Area Urbana
    ! 5 Ilha
    ! 6 Area Agricola
    x1=-41.0
    x2=-40.0	
    y1=-10.0
    y2=-9.0
     arq_ent='areairrigada.dat' 
 !  Abrindo arquivo
  
        OPEN(10,FILE=arq_ent(1:len_trim(arq_ent)),STATUS='old',Action='Read')
        !Read(10,*)((sfc_km(i,j), i=1,nxgrd), j=1,nygrd)  

        Do j=1,nygrd
           Read(10,*)(sfc_km(i,j), i=1,nxgrd)
	End do

	Do j=1,nygrd
           Do i=1,nxgrd
              If(sfc_km(i,j).ne.2.and. &
                 sfc_km(i,j).ne.6)sfc_km(i,j)=-1
              If(sfc_km(i,j)==1)sfc_km(i,j)=classe_olson(1)
	      If(sfc_km(i,j)==2)sfc_km(i,j)=classe_olson(17)
	      If(sfc_km(i,j)==6)sfc_km(i,j)=classe_olson(16)       
	   End do 
        End do

		         
 Return
 End


      Subroutine mkveg(iveg)
!-----------------------------------------------------------------
!
!      input parameters:
!
!         nx     - number of x (longitude) gripoints in input array (topo) 
!         ny     - number of y (latitude) gripoints in input array (topo) 
!         topo   - input latitude-logitude array of topography heights 
!                  in meters.
!         iwlon  - west longitude of topo (-180 to 180 degrees)
!         islat  - south latitude of topo (-90 to 90 degrees)
!         tres   - topo resolution in degrees
!         iblsize- size in degrees of output files (they will have the
!                  same number of points in x and y.
!         fpref  - file name prefix for output files (can include path)
!         scr    - scratch array of at least (iblsize/tres+1)**2
!
!     note that iwlon, islat, and iblsize are all integers.
!-------------------------------------------------------------------------
         
 !     parameter (nx=21600,ny=14400)
 !     parameter (iblsize=10,tres=1./120.)
 !     parameter (ibldim=int(float(iblsize)/tres+.001)+1) 
 !     integer*2 iveg(nx,ny)     
 !     dimension scr(ibldim,ibldim)
 !     Real tres      !       
 !     character*6 fpref

      parameter (nx=2404,ny=2404)
      integer*2 iveg(nx,ny)
      parameter (iblsize=5,tres=1./120.)
      parameter (ibldim=int(float(iblsize)/tres+.001)+1) 
      dimension scr(ibldim,ibldim)       
      character*2 fpref
!
      fpref='GE'
      iwlon   = -55
      islat   = -20
      offlat  = 0.0
      offlon  = 0.0

      call mktopo(nx,ny,iveg,iwlon,islat,tres,iblsize,ibldim,fpref,scr,offlat,offlon)

      Return
      end
!-----------------------------------------------------------------
!
      SUBROUTINE MKTOPO(NX,NY,TOPO,IWLON,ISLAT,TRES,IBLSIZE,IBLDIM,FPREF,SCR,offlat,offlon)
      CHARACTER*(*) FPREF
      CHARACTER*12 FPREF3
      INTEGER*2 TOPO(NX,NY)
      INTEGER*1 SCR(IBLDIM,IBLDIM)
      CHARACTER*80 TITLE1,TITLE2,TITLE3
!
      NSQX=NX/(IBLDIM-1)
      NSQY=NY/(IBLDIM-1)
      print*,NSQX,NSQY,IBLDIM
!cccccccccccc
      !      WRITE(TITLE1,'(A12)') FPREF//'HEADER'
      !      TITLE3=FPREF(1:len_trim(FPREF))//TITLE1(1:12)
      !      OPEN(30,STATUS='UNKNOWN',FILE=TITLE3,FORM='FORMATTED')
            PRINT*, 'Making file-',TITLE3
      !      WRITE(30,14)IBLSIZE,IBLDIM,ISLAT,IWLON,offlat,offlon
 !14         FORMAT(4I5,2f10.6)
 !           CLOSE(30)
!cccccccccccc
      DO 1 NSX=1,NSQX
         DO 2 NSY=1,NSQY
            I=(NSX-1)*(IBLDIM-1)+1
            J=(NSY-1)*(IBLDIM-1)+1
            LAT=ISLAT+(NSY-1)*IBLSIZE
            LON=IWLON+(NSX-1)*IBLSIZE

            LATT=ABS(LAT)/10
            LATO=ABS(LAT)-LATT*10
            LONH=ABS(LON)/100
            LONT=(ABS(LON)-LONH*100)/10
            LONO=ABS(LON)-LONH*100-LONT*10

            IF(LAT.GE.0)THEN
               WRITE(TITLE1,'(2I1,A1)')LATT,LATO,'N'
            ELSE
               WRITE(TITLE1,'(2I1,A1)')LATT,LATO,'S'
            ENDIF
            IF(LON.GE.0)THEN
               WRITE(TITLE2,'(3I1,A1)')LONH,LONT,LONO,'E'
            ELSE
               WRITE(TITLE2,'(3I1,A1)')LONH,LONT,LONO,'W'
            ENDIF

            NBL=INDEX(FPREF,' ')-1
            IF(NBL.EQ.-1) NBL=LEN(FPREF)
            TITLE3=FPREF(1:NBL)//TITLE1(1:3)//TITLE2(1:4)
            PRINT*, NSX,NSY,i,j,LAT,LON
            PRINT*, 'Making file-',TITLE3

            nwater=0           
            jr=1
            do 10 jj=j,(ibldim-1)+j
               ir=1
               do 11 ii=i,(ibldim-1)+i
                  scr(ir,jr)=nint(float(topo(ii,jj))+0.01)
                  ir=ir+1
                  
 11            continue
               jr=jr+1
 10         continue

            OPEN(29,STATUS='UNKNOWN',FILE=TITLE3,FORM='UNFORMATTED')
            write(29)scr
            CLOSE(29)

 2       CONTINUE
 1    CONTINUE
!
      END
