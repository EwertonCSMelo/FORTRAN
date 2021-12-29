!Este programa tem como objetivo realizar a interpolação em varios graus
!Se ordem igual a 1 entao é linear
!Criado por Ewerton   22 de junho de 2007
!Ultima data de modificação  22 de junho de 2007

Integer m
Parameter (m=10)
Double precision f(m,m),dfx(m),dfy(m),ff(m),coluna(m),g(m,m),x(m),y(m),prod,&
                 pn,xi,pi,grau,rad
Integer n,ni,nf,o,ordem0,c,np,ptn(m),ptr

pi=4*atan(1.0)
grau=180/pi
rad=pi/float(180)
!inicializando x
x=0
Do i=1,m
   !x(i)=x(i)+.5
   x(i)=x(i)+(i-1)*10*rad
End do

!inicializando y
y=0
Do i=1,m
   y(i)=y(i)+.5
End do


Do i=1,m
   Do j=1,m
      f(i,j)=cos(x(i))
   End do
    !write(*,*)x(i)*grau,f(i,1)
End do
dfx=1
n=3 !ordem da interpolaçao 

!determinando numero de pontos necessarios
Do k=1,n+1
   ptn(k)=k  !numero de pontos necessarios nas extremidades para realização do metodo
End do

xi=45*rad

!Diferença de ordem n considere n igual 1 ordem 0



!Calculando diferenças com respeito a x
   
   Do c=1,m  
     ff(c)=f(c,1) !Armazenando valores da ff a ser realizada a interpolação
   End do

   np=m
   ni=1
   Do while(xi.gt.x(ni))
	  ni=ni+1
   End do
      ni=ni-2

!testando possibilidade do teste
ptr=np-(ni+ptn(n+1)-1)      !numeros de pontos restantes

If (ptr.lt.0) then

   write(*,*)'Infelizmente a interpolacao nao sera possivel'

else


   dfx=0
   Do i=1,(n+1)
      Do k=ni,(i+ni-1)
	    prod=1 !valor inicial do produtorio
		Do j=ni,(i+ni-1)		
          If(j.ne.k)prod=prod*(x(k)-x(j)) !Calculo do produtorio        
        End do 	
       dfx(i)=dfx(i)+ff(k)/prod  !Calculo do somatorio
	 End do 
   End do

! Polinomio de interpolação

Pn=0
  
  Do i=1,(n+1)
     prod=1
	 If (i.ne.1) then
	    nf=(i+ni-2)
	    Do j=ni,nf
		   prod=prod*(xi-x(j))
        End do
     End if
	 Pn=Pn+prod*dfx(i)
  End do

  Write(*,*)Pn,acos(Pn)*180/pi,((cos(xi)-pn)/cos(xi))*100


End if
Stop
End

