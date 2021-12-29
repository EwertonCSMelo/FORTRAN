#! /bin/sh
# Este Shell tem por finalidade gerar os dp's a partir de um arquivo 
# visualizavel em GrADS. (combinado com o geraBIN.gs e o geraDP.x(f90))
#
# Demerval S. Moreira (demerval@master.iag.usp.br) 02/Mai/2003
#

#para executar automaticamente basta executar como segue o exemplo: 
#  /usr/local/bin/geraDP.sh /p1/ramsop/opera/grads/2g_030502001.ctl   u     v   tempk  geo  ur  7 -999 -999 -999 -999 N
#                                                                   (m/s) (m/s)  (K)   (m) (%)
#
#-> O 7 indica que possui umidade relativa para os primeiros sete niveis. 
#-> Caso queira definir uma area menor basta substituir os -999 por: lati latf loni lonf
#-> Caso o binario já estja no formato de leitura do fortran, substitua o "N" por "S"
#
#PS: Os arquivos geraDP.sh, geraDP.gs e geraDP.x devem estar no mesmo diretorio.
                                                                                         
#export GAUDFT=/shared/home/ramsop/util/udft.regrid2

grads=grads
DIR_fonte=`dirname $0`
DIR_dp=`pwd`

echo "Os DPs serao gerados no diretorio corrente: "`pwd` 
########################
nome=$1
u=$2
v=$3
temp=$4
geo=$5
ur=$6
zmax=$7
lat2i=$8
lat2f=$9
lon2i=${10}
lon2f=${11}
to_f90=${12}
########################
  
if [ x$1 = "x" ]
then
  ls -1 *.ctl
  echo;echo -n "Entre Com o nome do CTL (ex: /p1/ramsop/avn/03050200/avn.ctl)=> "
  read nome
#  nome="/p1/ramsop/opera/grads/2g_030502001.ctl" #tmp
#  nome="glob1.ctl" #tmp
  echo;echo -n 'O binario já está preparado para ser lido pelo fortran - Em caso de dúvida escolha "N" (s/N): '
  read to_f90
fi


nX=`grep -i xdef $nome | awk '{print $2}'` 
loni=`grep -i xdef $nome | awk '{print $4}'` 
intX=`grep -i xdef $nome | awk '{print $5}'` 
nY=`grep -i ydef $nome | awk '{print $2}'` 
lati=`grep -i ydef $nome | awk '{print $4}'` 
intY=`grep -i ydef $nome | awk '{print $5}'` 
nlev=`grep -i zdef $nome | awk '{print $2}'` 
nt=`grep -i tdef $nome | awk '{print $2}'` 
indef=`grep -i UNDEF $nome | awk '{print $2}'` 
linear=`grep -i ydef $nome | awk '{print substr($3,2,1)}'`
linearx=`grep -i xdef $nome | awk '{print substr($3,2,1)}'`

if [ $linear = 'e' -o $linear = 'E' -o  $linearx = 'e' -o $linearx = 'E' ];then
  echo;echo "O espaçamento em X ou em Y não é linear, será necessário utilizar previamente o regrid. Saindo..."
  exit
fi  
#echo "--->"$indef"|"
#exit
cd $DIR_dp
if test -s $DIR_dp/dims.txt; then rm -f $DIR_dp/dims.txt; fi
if [ x$to_f90 = "xS" -o x$to_f90 = "xs" ]; then
  Nbin=`grep -i dset $nome | awk '{print $2}'` 
  tem=`echo $Nbin | grep "\^" | wc -l`
  if [ $tem -eq 1 ];then Nbin=`dirname $nome`/`echo $Nbin | sed s%"\^"%%g`; fi
  if test ! -s $Nbin; then echo;echo "Não foi encontrado o binário: $Nbin    Saindo...";exit;fi
  echo $Nbin

  $grads -clb "run $DIR_fonte/geraBIN.gs $nome $nX $loni $intX $nY $lati $intY $nlev $nt $indef $linear $u $v $temp $geo $ur $zmax $lat2i $lat2f $lon2i $lon2f S"
else
  echo "------------- Gerando o binário a ser lido pelo Fortran ---------------------"
  $grads -clb "run $DIR_fonte/geraBIN.gs $nome $nX $loni $intX $nY $lati $intY $nlev $nt $indef $linear $u $v $temp $geo $ur $zmax $lat2i $lat2f $lon2i $lon2f N"
  echo "------------- Binário gerado ---------------------"
  Nbin=$DIR_dp/'to_dp.gra'
fi

tam=`ls -l $Nbin | awk '{print $5}'`

echo "------------- Gerando agora os Dps ---------------------"
$DIR_fonte/geraDP.x $Nbin $tam $DIR_dp'/'
rm -f $DIR_dp/dims.txt
if [ x$to_f90 = "xS" -o x$to_f90 = "xs" ]; then
  echo "Mantendo o arquivo $Nbin"
else
  echo "Removendo o arquivo $Nbin"
  rm -f $Nbin
fi

exit





