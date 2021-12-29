	 program lergrd
	 implicit none
	 Integer nvar,npx,npy
	 Parameter (nvar=1,npx=105,npy=105)
	 character nomeGRA*100,c
	 integer nX,nY,nZ,nT,gr,t,irec,i,j,z,ivar,tam,maq,iDIR_dp,nV,na
	 real loni,lati,intX,intY,nXr,nYr,nZr
	 integer*1 vtype2(npx,npy)
	 nX=npx
	 nY=npy
	 nT=1
	 nZ=1	 
	 nV=5
	 maq=1   ! coloque maq=4 caso a maquina for little_endian ou maq=1 caso for big_endian 

	nomeGRA='vtype2.grd'
	
	tam=1
	c=nomeGRA(tam:tam)
	Do While(c.ne.'.')
	   c=nomeGRA(tam:tam) !armazenar caracter a ser testado
	   If(c.ne.'.')tam=tam+1 ! Definindo posição do ponto
	End do

	OPEN(1,FILE=nomeGRA(1:len_trim(nomeGRA)),STATUS='old',FORM='unformatted',RECL=nX*nY*maq)
	irec=1
    read(1,rec=irec)((vtype2(i,j),i=1,nx),j=ny,1,-1)
	
 	close (1)

   	Open (2,file=nomeGRA(1:tam)//'txt') 
    write(*,5)((vtype2(i,j),j=1,ny),i=1,nx)
    5 format(105I3)	  
    close (2)		
 


	Stop
	end
	
