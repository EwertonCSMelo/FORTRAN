	 program lergrd
	 implicit none
	 Integer nvar
	 Parameter (nvar=5,nT=25)
	 character nomeGRA*100,c
	 integer nT,nX,nY,nZ,gr,t,irec,i,j,z,ivar,tam,maq,iDIR_dp,nV,na
	 real loni,lati,intX,intY,nXr,nYr,nZr
	 real uvhlet(nvar,nT)
	 nX=1
	 nY=1
	 nZ=1	 
	 nV=5
	 maq=4  ! coloque maq=4 caso a maquina for little_endian ou maq=1 caso for big_endian 

	Write(*,*)'INMET (1) PCD (2)'
	Read(*,*)na
	
	If (na==1)nomeGRA='uvhletINMET.grd'
	If (na==2)nomeGRA='uvhletPCD.grd'
	tam=1
	c=nomeGRA(tam:tam)
	Do While(c.ne.'.')
	   c=nomeGRA(tam:tam) !armazenar caracter a ser testado
	   If(c.ne.'.')tam=tam+1 ! Definindo posição do ponto
	End do

	OPEN(1,FILE=nomeGRA(1:len_trim(nomeGRA)),STATUS='old',FORM='unformatted',ACCESS='direct',RECL=nX*nY*maq)
	
	Open (2,file=nomeGRA(1:tam)//'txt')
        irec=0
	Do i=1,nv
	   Do t=1,nt
	      irec=irec+1
	       read(1,rec=irec)uvhlet(i,t)
	   End do
        End do	
 	close (1)
           write(2,*)'T(UTC) u(m/s)   v(m/s)  H(W/m2) LE(W/m2)  T(oC)'
           Do t=1,nt
	       write(2,5)t+5,(uvhlet(i,t),i=1,nv)
	    5 format(2x,I2,5F9.3)	  
	   End do
        close (2)		
	Stop
	end
	
