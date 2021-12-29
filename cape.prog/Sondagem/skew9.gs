function main(args)

ficheiro=subwrd(args,1)
lugar=subwrd(args,2)
dia=subwrd(args,3)
mes=subwrd(args,4)
hora=subwrd(args,5)
ano=subwrd(args,6)

if (ficheiro = '' | lugar = '' | dia = '' | mes = '' | hora = '')
   say 'Erro: faltou um ou mais argumentos obrigatórios!!!!'
   say 'Forma correta: skew9 [arquivo] [lugar] [dd] [mm] [hh] [aaaa -opcional]'
   exit
endif
if (ano = '')
   say 'Aviso: Não foi especificado ano algum! Assumir-se-á 2001...'
   ano=2001
endif

if (mes > 0 & mes <13)
    mmm=meses(mes)
 else 
    say 'Erro: O mês não é válido!!!!!'
    exit
endif
eps='diag-'lugar''ano''mes''dia''hora'.gmf'
'reinit'
'set display color white'
'clear'
'open 'ficheiro
'query file'
entao=subwrd(result,1)
if (entao = 'No' | entao = 'no')
   say 'Erro: Não há o arquivo 'ficheiro'.'
   exit
endif
'enable print 'eps
'set xlopts 1 5 0.17'
'set ylopts 1 5 0.17'
'set annot 1 5'
'set lev 1020 100' ;* Não mexa neste parâmetro, senão os eixos ficam estranhos
titulo=lugar' - 'dia'/'mmm'/'ano' - 'hora'TMG'
'define temp=temp'
'define dewp=torv'
'define velv=mag(uvel,vvel)'
'define dirv=270.-atan2(vvel,uvel)*180./3.14159265359'
lixo=plotskew(temp,dewp,-1,-1)
lixo=plotskew(-1,-1,velv,dirv)
'close 1'
'draw title 'titulo
'print'
'disable print'

* Verificando se eh linux
eh_linux=read('/etc/passwd')
eh_linux=sublin(eh_linux,1)

if (eh_linux=0)
  '!gxeps -c -i 'eps' -o-'
  '!gxgif -r -i 'eps''
  '!rm -f 'eps
else
  '!gxeps.exe -c -i 'eps' -o-'
  '!gxgif.exe -r -i 'eps''
  '!rm -f 'eps
endif

'printim 'lugar'_'ano''mmm''dia''hora'.gif gif white'

say 'Gerado a figura em .eps e .gif'
'quit'
return

***************************************************************************************

function plotskew(sndtemp,snddewp,sndspd,snddir)

***************************************************************************************
*
* "Script" do GrADS para plotar um diagrama do tipo SkewT/LogP
*
* Originalmente produzido por: 
* Bob Hart 
* Penn State University / Dept of Meteorology
* Ultima alteracao:  24 de junho de 1998
* Ultima alteracao:  18 de agosto de 1998 (removidos 2 bugs)
*
* Alterado por:
* Carlos Frederico Mendonca Raupp, Luis Gustavo de Paiva Pereira, Marcel Ricardo Rocco, 
* Marcos Longo, Paulo Takeshi Matsuo, Rachel Ifanger Albrecht
*
* Recursos da ultima versao em ingles:
*  
*   - Calculo dos niveis de altura reais baseados nos valores de pressao e temperatura
*     (variaveis DrawZlev, SfcElev);
*   - Calculo da agua precipitavel;
*   - Calculo do LI, CAPE, CIN para niveis mais instaveis (maior nivel no qual ha
*     registros do theta-e), resultando a tajetoria da parcela (DrawPMax);
*   - Liberdade de reposicionae a caixa de saida contento os indices e o hodografo
*     (Variaveis Text1XC, Text1YC, Text2XC, etc.);
*   - Rotulos dos eixos opcionais (variavel LblAxes);
*   - Voce escolhe o numero de aneis do hodografo (variavel NumRing);
*   - Voce escolhe a opcao de plotar ou nao o hodografo (variaveis TickInt, TickSize).
*
* Recursos:
*   - Todas os dispositivos da plotagem padrao skewT/logp;
*   - Localizacao do NCL;
*   - Trajetoria da parcela tanto desde a base da conveccao em superficie quanto 
*      elevada a partir do nivel de maior instabilidade (maior theta-e registrado);
*   - Calculo dos indices de estabilidade e total de agua precipitavel;
*   - Calculos de CAPE e CIN;
*   - Perfil do Vento;
*   - Hodografo / Escala hodografica;
*   - Calculo e Apresentacao da "helicidade" e "helicidade SR"; 
*   - Aspecto de saida de cores;
*   - Espessura das linhas, estilo de saida;
*   - Pode ser executado tanto em modo retrato como em paisagem.
*
* Ha varios parametros ajustaveis abaixo para que se possa modificar a estrutura
* e saida do diagrama.
*
* Argumentos de funcoes:
*    sndtemp - dados de temperatura (Celsius) em funcao da pressao
*    snddewp - dados de temperatura do ponto de orvalo (Celsius) em funcao da pressao
*    sndspd  - dados de velocidade do vento (nos) em funcao da pressao      
*    snddir  - dados de direcao do vento (graus) em funcao da pressao
*
* Utilize '-1' para qualquer um dos 4 argumentos acima para indicar que voce nao
* esta fornecendo esta variavel. As opcoes apropriadas serao ignoradas com esta 
* especificacao
*
* OBSERVACAO: Certifique-se de ajustar o alcance vertical da plotagem antes da
*             execucao. Por exemplo, " SET LEV 1050 100". No entanto, isto nao deve 
*             ser limitado no alcance de pressao dos seus dados.
* 
* Indicacoes: Pressao/Altura sao indicados ao longo do lado esquerdo. A temperatura
*             indicada na parte inferior. A razao de mistura e indicada nas partes
*             direita/superior.
* 
*
* PROBLEMAS: Antes de mais nada, entre na pagina da Internet e pegue o "script"
*            (que possui um "link" com um FAQ - respostas as questoes frequentes: 
*             http://www.ems.psu.edu/~hart/skew.html)
*
* Por favor envie um e-mail com qualquer problema, duvidas, comentarios ou sugestoes
* para:
* 1. (Versao em ingles) => hart@ems.psu.edu
* 2. (Versao em portugues) => ptmatsuo@model.iag.usp.br
*
*

**************************************************************************
*      !!!!!! INICIANDO AS OPCOES ESPECIFICADAS PELOS USUARIOS !!!!!!
**************************************************************************

*
* --------------------------- Opcoes iniciais  ---------------------------
*
* ClrScrn = Opcao para limpar a tela antes de desenhar o diagrama
*           [1 = sim, 0 = nao]

ClrScrn = 0

*
* -------------- Define Forma/Inclinacao do Diagrama Skew-T  -------------
*
* (P1,T1) = pressao, temperatura em algum ponto na regiao mais a esquerda
* (P2,T2) = pressao, temperatura em algum ponto na regiao mais a direita
* (P3,T3) = pressao, temperatura em algum ponto que seja o ponto medio na 
*           horizontal entre 1 e 2.
*
* P1, P2, P3 estao em mb ; T1, T2, T3 estao em Celsius
*
* Com isto, serao definidas a inclinacao e a largura do diagrama, mas NAO
* SERA DEFINIDA A ALTURA do diagrama. Em outras palavras, 1 e 2 nao precisam
* necessariamente na parte inferior do diagrama e 3 nao precisa necessariamente
* estar no topo. O ALCANCE VERTICAL DA PRESSAO DO skewT E DETERMINADA POR
* 'set lev ...', QUE ESTA NA 3a. LINHA DESTE 'SCRIPT'.
*
*    _______________________
*   |                       |
*   |                       |
*   |           3           |
*   |                       |
*   |                       |
*   |                       |
*   |                       |
*   |                       |
*   |                       |
*   |                       |
*   |                       |
*   |1                     2|
*   |                       |
*   |_______________________|
*   
*
* Uma boa configuracao de pontos esta dada abaixo, mas sinta-se livre
* para experimentar variacoes.


P1 = 1000
T1 = -40

P2 = 1000
T2 = 40

P3 = 200
T3 = -50

* ------------------- Contorno dos Intervalos/ Niveis --------------------------
*
* Todas as variaveis abaixo se referem ao contorno dos intervalos/niveis do diagrama
*
* Thetaint = intervalo entre as linhas de temperatura potencial for potencial
* Thetwint = intervalo entre as linhas da pseudo-adiabaticas umidas
* tempint  = intervalo entre as linhas de temperatura
* wsclevs  = contorno dos niveis para linhas de razao de mistura
*
*

thetaint= 10
thetwint= 5
tempint = 10
wsclevs = "1 1.5 3 4 6 8 10 12 16 20 24 28 32 36 40"

*
* ------------------------ Opcoes de Saida --------------------------------
*
*
* Todas as variaveis sao do tipo 1=sim, 0=nao
*
* DrawBarb = desenha as barbatanas de vento a direita do diagrama
* DrawThet = desenha as adiabaticas secas
* DrawThtw = desenha as pseudo adiabaticas umidas
* DrawTemp = desenha as linhas de temperatura
* DrawMix  = desenha as linhas de razao de mistura
* DrawTSnd = desenha a linha de temperatura obtida na sondagem
* DrawDSnd = desenha a linha da temperatura do ponto de orvalho obtida na sondagem
* DrawPrcl = desenha a trajetoria da parcela a partir da superficie
* DrawPMax = desenha a trajetoria da parcela a partir do nivel mais instavel
* DrawIndx = exibe indices de estabilidade e CAPE
* DrawHeli = Calcula e exibe as "helicidades" absoluta e relativa a tempestades
* DrawHodo = desenha o hodografo
* DrawPLev = desenha o nivel de pressao 
* DrawZLev = desenha linhas e niveis de alturas
*        0 = sem linhas
*        1 = acima da superficie (AGL)
*        2 = acima da superficie do mar (ASL)
*

if (sndspd = -1)
DrawBarb= 1
DrawThet= 1
DrawThtw= 1
DrawTemp= 1
DrawMix = 1
DrawTSnd= 1
DrawDSnd= 1
DrawPrcl= 1
DrawPMax= 1
DrawIndx= 1
DrawHeli= 0
DrawHodo= 0
DrawPLev= 1
DrawZLev= 0
DrawZSTD= 0
LblAxes = 1
else
DrawBarb= 1
DrawThet= 0
DrawThtw= 0
DrawTemp= 0
DrawMix = 0
DrawTSnd= 0
DrawDSnd= 0
DrawPrcl= 0
DrawPMax= 0
DrawIndx= 0
DrawHeli= 1
DrawHodo= 1
DrawPLev= 0
DrawZLev= 0
DrawZSTD= 0
LblAxes = 0
endif

* 
* ---------------------  Opcoes de Sondagem Geografica ------------------------
*
* SfcElev = Altitude (metros) do mais baixo nivel medido na sondagem. Utilize 
*           apenas se DrawZLev=2.
*

SfcElev = 0


*
* ------------------ Opcoes de Indices Termodinamicos --------------------
*
* Todas as variaveis estao em polegadas. Use -1 para valores-padrao.
*
*  Text1XC = coordenada X do ponto medio da caixa de saida contendo K, TT, PW
*  Text1YC = coordenada Y do ponto medio da caixa de saida contendo K, TT, PW.
*  Text2XC = coordenada X do ponto medio da caixa de saida contendo os indices de superficie
*  Text2YC = coordenada Y do ponto medio da caixa de saida contendo os indices de superficie
*  Text3XC = coordenada X do ponto medio da caixa de saida contendo os indices baseados
*            no nivel mais instavel.
*  Text3YC = coordenada Y do ponto medio da caixa de saida contendo os indices baseados
*            no nivel mais instavel. 
*

Text1XC = -1
Text1YC = -1
Text2XC = -1
Text2YC = -1
Text3XC = -1
Text3YC = -1

*
* ----------------- Opcoes do perfil de vento ----------------------------
*
* 
* Todas as variaveis abaixo estao em polegadas, a menos que esteja especificada 
* de outra forma
*
*  barbint = intervalo de plotagem das barbatanas (em unidades de niveis);
*  poleloc = coordenada X do perfil. Escolha -1 para modo padrao;
*  polelen = comprimento da barbatana do vento;
*  Len05   = comprimento de cada marca de 5-nos;
*  Len10   = comprimento de cada marca de 10-nos;
*  Len50   = comprimento de cada triangulo de 50-nos;
*  Wid50   = espessura da base do triangulo de 50-nos; 
*  Spac50  = espacamento entre o triangulo de 50 nos e a proxima marca/triangulo
*  Spac10  = espacamento entre a marca de 10 nos e a proxima marca 
*  Spac05  = espacamento entre a marca de 5 nos e a proxima marca
*  Flagbase= desenha a base do traco (circulo cheio) de cada barbatana [1=sim, 0 =nao] 
*  Fill50  = preenchimento do triangulo de 50 nos [1=sim, 0=nao]
*  barbline= desenha uma linha verdical unindo as barbatanas [1=yes, 0=no]
*

barbint = 1
poleloc = -1
polelen = 0.35
len05   = 0.07
len10   = 0.15
len50   = 0.15
wid50   = 0.06
spac50  = 0.07
spac10  = 0.05
spac05  = 0.05
Fill50  = 1
flagbase= 1
barbline= 1

*
*---------------- Opcoes do hodografo -------------------------------------
*
* Todas as variaveis estao em polegadas, a nao ser que outra unidade esteja especificada
*
* HodXcent= coordenada X do centro do hodografo. Use -1 para localizacao padrao.
* HodYcent= coordenada Y do centro do hodografo. Use -1 para localizacao padrao.
* HodSize = Tamanho do hodografo 
* NumRing = Numero de aneis do hodografo (deve ser ao menos 1)
* HodRing = Escala do hodografo
* HodoDep = Profundidade (acima do mais baixo nivel em mb) do fim do traco do hodografo
* TickInt = Intervalo (em nos) que as marcas sao desenhadas ao longo dos eixos. 
*           Use 0 para desativar esta funcao
* TickSize= Tamanho da marca
* Text4XC = coordenada X do ponto medio da saida do texto do hodografo. 
*           Use -1 para coordenada padrao.
* Text4YC = coordenada Y do ponto medio da saida do texto do hodografo. 
*           Use -1 para coordenada padrao.

HodXcent= -1
HodYcent= -1
HodSize = 2
NumRing = 3
HodRing = 15
HodoDep = 300
TickInt = 5
TickSize= 0.05
Text4XC = -1
Text4YC = -1

*--------------- Opcoes de Helicidade ---------------------------------------
*
* MeanVTop = Calculo do mais alto nivel de pressao do vento medio 
* MeanVBot = Calculo do mais baixo nivel de pressao do vento medio
* HelicDep = Integracao da profundidade (em mb) (acima do chao) da helicidade
* StormMot = Esquema do tipo da estimativa do deslocamento da tempestade. Utilize: 
*            0 = Nenhuma mudanca significativa do vento referido;
*            1 = Aproximacao de Davies-Jones (1990).
* FillArrw = Opcoes de preenchimento da ponta do vetor do deslocamento da tempestade;
*            [1 = sim, 0 = nao]

MeanVTop= 300 
MeanVBot= 850
HelicDep= 300
StormMot= 1
FillArrw= 1

*
*---------------- Opcoes de Cores ------------------------------------------
*
* ThetCol = Cor das adiabaticas secas 
* TempCol = Cor das linhas de temperatura
* MixCol  = Cor das linhas de razao de mistura
* ThtwCol = Cor das adiabaticas umidas
* TSndCol = Cor das temperaturas obtidas na sondagem 
* DSndCol = Cor das temperaturas de ponto de orvalho obtidas na sondagem
* PrclCol = Cor da trajetoria da parcela
* BarbCol = Cor das barbatanas de vento (escolha -1 para ajustar as cores 
*           de acordo com a velocidade)
* HodoCol = Cor do traco do hodografo


ThetCol = 2
TempCol = 4
MixCol  = 15
ThtwCol = 3
TSndCol = 1 
DSndCol = 1
PrclCol = 5
BarbCol = -1
HodoCol = 1

*
*-------------------- Opcao de estilo das linhas ------------------------------------
*
* Estilos do GrADS: 1=solida;2=traco comprido;3=traco curto;4=traco curto, longo;
*               5=pontilhado;6=ponto traco;7=ponto ponto traco
*
* ThetLine = estilo de linha da adiabatica seca
* TempLine = estilo das linhas de temperatura
* MixLine  = estilo de linha da razao de mistura
* ThtwLine = estilo das linhas da adiabatica umida
* TSndLine = estilo de linha da temperatura obtida na sondagem
* DSndLine = estilo de linha da temperatura de ponto de orvalho 
*            obtida na sondagem
* HodoLine = estilo do traco do hodografo
*


ThetLine = 1
TempLine = 1
MixLine  = 1
ThtwLine = 3
TSndLine = 1
DSndLine = 1
PrclLine = 5
HodoLine = 1

*
*------------------- Opcoes de espessura de linha ---------------------------------
* Espessura de linhas do GrADS: aumenta com o crescimento do numero. O aumento numerico 
*                               nao parece e tao absurdo na tela.                        
*                       
*
* ThetThk = espessura da linha adiabatica seca
* TempThk = espessura da linha de temperatura
* MixThk  = espessura da linha de razao de mistura
* ThtwThk = espessura da linha abiabatica umida
* TSndThk = espessura da linha de temperatura obtida na sondagem
* DSndThk = espessura da linha de temperatura de ponto de orvalho obtida na sondagem
* PrclThk = espessura da trajetoria da parcela
* HodoThk = espessura do traco do hodografo
* BarbThk = espessura da barbatanas do vento*
*

ThetThk = 3
TempThk = 3
MixThk  = 3
ThtwThk = 3
TSndThk = 8 
DSndThk = 8
PrclThk = 6 
HodoThk = 3 
BarbThk = 2

****************************************************************************
****************************************************************************
****************************************************************************
*        !!!!! NAO E PRECISO MUDAR NADA A PARTIR DESTE PONTO !!!!!         *
****************************************************************************
****************************************************************************
****************************************************************************

*-----------------------------------------------------
* Algumas variaveis usadas para conversao de unidades. 
*-----------------------------------------------------

_pi=3.14159265
_dtr=_pi/180
_rtd=1/_dtr 
_ktm=0.514444
_mtk=1/_ktm

*------------------------------------------------------
* Algumas constantes usadas em calculos termodinamicos.
*------------------------------------------------------

_C0=0.99999683 
_C1=-0.90826951/100
_C2= 0.78736169/10000
_C3=-0.61117958/1000000
_C4= 0.43884187/pow(10,8) 
_C5=-0.29883885/pow(10,10)
_C6= 0.21874425/pow(10,12)
_C7=-0.17892321/pow(10,14)
_C8= 0.11112018/pow(10,16)          
_C9=-0.30994571/pow(10,19)

_D1=2.5*pow(10,6)

*----------------------------------------------------------------------------
* Calculo da potencia da distribuicao de presso que deve ser executada apenas 
* uma unica vez para diminuir o tempo de execucao.
*----------------------------------------------------------------------------

zz=1100
while (zz > 10)
    subscr=zz/10
    _powpres.subscr=pow(zz,0.286)
    zz=zz-10
endwhile

*----------------------------------------------------------------------------
* Desliga as opcoes nao disponiveis devido as limitacoes ds dados do usuario. 
*----------------------------------------------------------------------------

If (ClrScrn = 1) 
  "clear"
Endif

If (sndspd = -1 | snddir = -1) 
  DrawBarb = 0
  DrawHodo = 0
  DrawHeli = 0
Endif

If (snddewp = -1) 
  DrawDSnd = 0
  DrawPrcl = 0
  DrawPMax = 0
  DrawIndx = 0
Endif

If (sndtemp = -1)
  DrawTSnd = 0
  DrawPrcl = 0
  DrawPMax = 0
  DrawIndx = 0
  DrawZLev = 0
Endif

If (NumRing < 1) 
  DrawHodo = 0
Endif 
  
"q gxinfo"
rec=sublin(result,2)
xsize=subwrd(rec,4)

If (xsize = 11) 
   PageType = "Landscape"
Else
   PageType = "Portrait"
Endif
  

*-------------------------------------------------------------
* capta as especificacoes do usuario das dimensoes do ambiente
*-------------------------------------------------------------

"q dims"
rec=sublin(result,2)
xval=subwrd(rec,9)
rec=sublin(result,3)
yval=subwrd(rec,9)
rec=sublin(result,4)
pmax=subwrd(rec,6)
pmin=subwrd(rec,8)
zmin=subwrd(rec,11)
zmax=subwrd(rec,13)
rec=sublin(result,5)
tval=subwrd(rec,9)

*----------------------------------------------------------------------
* calcula as constantes determinando a inclinacao e a forma do diagrama 
* baseado nos valores de pressao e temperatura fornecidos pelo usuario.
*----------------------------------------------------------------------

"set x 1"
"set y 1"
"set z 1"
"set t 1"
_m1=(T1+T2-2*T3)/(2*log10(P2/P3))
_m2=(T2-T3-_m1*log10(P2/P3))/50
_m3=(T1-_m1*log10(P1))

"set z "zmin" "zmax           
"set zlog on"
"set xlab off"

*-----------------------------------------------------
* Converte as coordenadas para o diagrama Skew-T/LogP.
*-----------------------------------------------------

"set gxout stat"
"set x "xval
"set y "yval
"set t "tval
"define tempx=("sndtemp"-"_m1"*log10(lev)-"_m3")/"_m2
"define dewpx=("snddewp"-"_m1"*log10(lev)-"_m3")/"_m2

If (PageType = "Portrait") 
   "set parea 0.7 7 0.75 10.5"
Else
   "set parea 0.7 6.5 0.5 8"
Endif
  
"set axlim 0 100"
"set lon 0 100"
"set grid on 1 1"

"set z "zmin " " zmax
"set lon 0 100"
"set clevs -900"
"set gxout contour"

*------------------------------
* Desenha as linhas de pressao.
*------------------------------

If (DrawPLev = 0) 
   "set ylab off"
Else
   "set ylab on"
   "set ylopts 1 5 0.17"
Endif

"d lon"

*-------------------------------------------------------------
* Determina as extremidades da moldura do diagrama skewt/logp. 
*-------------------------------------------------------------

"q w2xy 100 "pmin
rxloc=subwrd(result,3)
tyloc=subwrd(result,6)
"q w2xy 0 "pmax
lxloc=subwrd(result,3)
byloc=subwrd(result,6)

If (DrawPLev = 1 & LblAxes = 1)
   "set strsiz 0.11"
   "set string 1"
   If (PageType = "Portrait") 
      "draw string 0.25 10.25 mb"
   Else
      "draw string 0.25 7.75 mb"
   Endif
Endif

*--------------------------------------------------------------------------------
* Calcula e desenha as linhas de altura reais utilizando os dados de temperatura.
*--------------------------------------------------------------------------------

If (DrawZLev > 0)
   say "Calculando os niveis de altura obtidos dos dados de pressao e temperatura."
   zz=1
   "set gxout stat"
   "set x "xval
   "set y "yval
   "set t "tval
   count=0
   "set missconn on"
   while (zz < zmax)
      "set z "zz
      pp.zz=subwrd(result,4)
      lpp.zz=log(pp.zz)
      "d "sndtemp
      rec=sublin(result,8)
      tt=subwrd(rec,4)
      if (tt > -900) 
         tk=tt+273.15
         count=count+1
         zzm=zz-1
         If (count = 1) 
            If (DrawZLev = 2)
               htlb="ASL"
               height.zz=SfcElev
            Else
               htlb="AGL"
               height.zz=0
            Endif
            sfcz=height.zz
         Else
            DZ=29.2857*(lpp.zzm-lpp.zz)*(lpp.zz*tk+lpp.zzm*tkold)/(lpp.zz+lpp.zzm) 
            height.zz=height.zzm+DZ
            highz=height.zz
         Endif
      else
         height.zz = -9999
      endif
      tkold=tk
      zz=zz+1
   endwhile

   maxht=int(highz/1000)
   if (int(sfcz/1000) = sfcz/1000)
      minht=int(sfcz/1000)
   else
      minht=1+int(sfcz/1000)
   endif

   ht=minht
   "set line 1 3 1"
   "set strsiz 0.16"
   "set string 1 l 3 0"
   while (ht <= maxht)
       zz=1
       while (height.zz/1000 <= ht)
          zz=zz+1
       endwhile
       zzm=zz-1
       PBelow=pp.zzm
       PAbove=pp.zz
       HBelow=height.zzm
       HAbove=height.zz
       DZ=HAbove-HBelow
       DP=PAbove-PBelow
       Del=ht*1000-HBelow
       Est=PBelow+Del*DP/DZ
       If (Est >= pmin & Est <= pmax)
          "q w2xy 1 " Est
          yloc=subwrd(result,6)
          "draw line " lxloc " " yloc " " rxloc " " yloc
          "draw string 0.22 "yloc-0.05" "ht
       Endif
       ht=ht+1
   endwhile
   "set strsiz 0.06"
   "set string 1"
   If (LblAxes = 1)
      If (PageType = "Portrait") 
         "draw string 0.25 10.85 km"
         "draw string 0.25 10.75 "htlb
         "draw string 0.25 10.65 OBS"
      Else
         "draw string 0.25 8.35 km"
         "draw string 0.25 8.25 "htlb
         "draw string 0.25 8.15 OBS"
      Endif
   Endif
Endif


*----------------------------------------------------------------------------
* Desenha niveis de altura (acima do nivel do mar usando a atmosfera padrao).
*----------------------------------------------------------------------------

If (DrawZSTD = 1)
   "set strsiz 0.08"
   minht=30.735*(1-pow(pmax/1013.26,0.287))
   minht=int(minht+0.5)
   maxht=30.735*(1-pow(pmin/1013.26,0.287))
   maxht=int(maxht)
   "set gxout stat"
   zcount=minht        
   while (zcount <= maxht) 
      plev=1013.26*pow((1-zcount/30.735),3.4843)
      "q w2xy 0 "plev 
      yloc=subwrd(result,6)
      "draw string 0 "yloc-0.05" "zcount
      zcount=zcount+1
   endwhile
   "set strsiz 0.06"
   If (LblAxes = 1)
      If (PageType = "Portrait") 
         "draw string 0 10.85 km"
         "draw string 0 10.75 ASL"
         "draw string 0 10.65 STD"
      Else
         "draw string 0 8.35 km"
         "draw string 0 8.25 ASL"
         "draw string 0 8.15 STD"
      Endif
  Endif
Endif


*--------------------------------
* Plota as linhas de temperatura.
*--------------------------------

If (DrawTemp = 1)
   "set strsiz 0.16"
   "set z "zmin " " zmax
   "set line "TempCol " " TempLine " "TempThk
   "set string 1"
   "set gxout stat"
   maxtline=GetTemp(100,pmax)
   mintline=GetTemp(0,pmin)

   maxtline=tempint*int(maxtline/tempint)
   mintline=tempint*int(mintline/tempint)

   tloop=mintline
   While (tloop <= maxtline) 
       Botxtemp=GetXLoc(tloop,pmax)
       "q w2xy "Botxtemp " " pmax
       Botxloc=subwrd(result,3)
       Botyloc=byloc           
       Topxtemp=GetXLoc(tloop,pmin)
        "q w2xy "Topxtemp " " pmin
       Topxloc=subwrd(result,3)
       Topyloc=tyloc            
       If (Botxtemp <= 100 | Topxtemp <= 100) 
          If (Topxtemp > 100)
             Slope=(Topyloc-Botyloc)/(Topxtemp-Botxtemp)
             b=Topyloc-Slope*Topxtemp
             Topyloc=Slope*100+b
             Topxloc=rxloc         
          Endif
          If (Botxtemp < 0)
             Slope=(Topyloc-Botyloc)/(Topxtemp-Botxtemp)
             b=Botyloc-Slope*Botxtemp
             Botyloc=b
             Botxloc=lxloc 
          Else
             "draw string " Botxloc-0.2 " " Botyloc-0.2 " " tloop
          Endif
          "draw line "Botxloc " " Botyloc " " Topxloc " " Topyloc
       Endif
       tloop=tloop+tempint
   EndWhile
   If (LblAxes = 1) 
      "set strsiz 0.17"
      "set string 1 c"
      If (PageType = "Portrait")
         "draw string 4.0 0.35 Temperatura (`3.`0C)"
      Else
         "draw string 3.5 0.15 Temperatura (`3.`0C)"
      Endif
   Endif
Endif


*----------------------------
* Plota as adiabaticas secas.
*----------------------------

If (DrawThet = 1)
   temp=GetTemp(100,pmin)
   maxtheta=GetThet2(temp,-100,pmin)
   maxtheta=thetaint*int(maxtheta/thetaint)
   temp=GetTemp(0,pmax)
   mintheta=GetThet2(temp,-100,pmax)
   mintheta=thetaint*int(mintheta/thetaint)
   
   "set lon 0 100"
   "set y 1"
   "set z 1"
   tloop=mintheta
   "set line "ThetCol" "ThetLine " "ThetThk
   While (tloop <= maxtheta)
     PTemp=LiftDry(tloop,1000,pmin,1,pmin,pmax)     
     tloop=tloop+thetaint
   Endwhile
Endif

*-------------------------------------
* Plota as linhas de razao de mistura.
*-------------------------------------

If (DrawMix = 1)
   "set string 1 l"
   "set z "zmin " " zmax
   "set cint 1"
   "set line "MixCol" " MixLine " "MixThk
   cont = 1
   mloop=subwrd(wsclevs,1)
   count = 1
   While (cont = 1) 
       BotCoef=log(mloop*pmax/3801.66)
       BotTval=-245.5*BotCoef/(BotCoef-17.67)
       Botxtemp=GetXLoc(BotTval,pmax)
       "q w2xy "Botxtemp " " pmax
       Botxloc=subwrd(result,3)
       Botyloc=byloc            
       TopCoef=log(mloop*pmin/3801.66)
       TopTval=-245.5*TopCoef/(TopCoef-17.67)
       Topxtemp=GetXLoc(TopTval,pmin)
       "q w2xy "Topxtemp " " pmin
       Topxloc=subwrd(result,3)
       Topyloc=tyloc            
       "set string 1 l 3"
       "set strsiz 0.17"
       If (Botxtemp <= 100 | Topxtemp <= 100) 
          If (Topxtemp > 100)
             Slope=(Topyloc-Botyloc)/(Topxtemp-Botxtemp)
             b=Topyloc-Slope*Topxtemp
             Topyloc=Slope*100+b
             Topxloc=rxloc 
             "draw string " Topxloc+0.05 " " Topyloc  " " mloop
          Else
             "draw string " Topxloc " " Topyloc+0.1 " " mloop
          Endif
          If (Botxtemp < 0)
             Slope=(Topyloc-Botyloc)/(Topxtemp-Botxtemp)
             b=Botyloc-Slope*Botxtemp
             Botyloc=b
             Botxloc=lxloc        
          Endif
          "draw line "Botxloc " " Botyloc " " Topxloc " " Topyloc
       Endif
       count=count+1
       mloop=subwrd(wsclevs,count)
       If (mloop = "" | count > 50) 
          cont = 0
       Endif
   EndWhile
   If (LblAxes = 1)
      "set strsiz 0.17"
      "set string 1 c 3 90"
      If (PageType = "Portrait")
         "draw string 7.55 4.75 Razao de Mistura (g/kg)"
      Else
         "draw string 6.95 4.25 Razao de Mistura (g/kg)"
      Endif
      "set string 1 c 3 0"
   Endif
Endif

*-----------------------------
* Plota as adiabaticas umidas.
*-----------------------------

If (DrawThtw = 1)
   "set lon 0 100"
   "set y 1"
   "set z 1"
   "set gxout stat"
   tloop=80
   "set line "ThtwCol" "ThtwLine " "ThtwThk
   While (tloop > -80)
     PTemp=LiftWet(tloop,1000,pmin,1,pmin,pmax)     
     tloop=tloop-thetwint
   Endwhile
Endif

*-------------------------------------------------------
* Plota temperatura da sondagem modificada pelo usuario.
*-------------------------------------------------------

If (DrawTSnd = 1)
   say "Plotando os valores de temperatura da sondagem."
   "set gxout line"
   "set x "xval
   "set y "yval
   "set z "zmin" "zmax     
   "set ccolor "TSndCol
   "set cstyle "TSndLine
   "set cmark 0"
   "set cthick "TSndThk 
   "set missconn on"
   "d tempx"
Endif

*---------------------------------------------------------------------------
* Plota temperatura do ponto de orvalho da sondagem modificada pelo usuario.
*---------------------------------------------------------------------------

If (DrawDSnd = 1)
   say "Plotando os valores de temperatura do ponto de orvalho da sondagem."
   "set gxout line"
   "set x "xval
   "set y "yval
   "set z "zmin" "zmax
   "set cmark 0"
   "set ccolor "DSndCol
   "set cstyle "DSndLine
   "set cthick "DSndThk
   "set missconn on"
   "d dewpx"
Endif

*----------------------------------------------------
* Determina o menor nivel dentre os dados observados.
*----------------------------------------------------

If (DrawTSnd = 1 & DrawDSnd = 1)
   "set gxout stat"
   zz=1
   temp=-999
   "set x "xval
   "set y "yval
   "set t "tval
   "set z 1"
   "set missconn on"
   While (abs(Sfctemp) > 130 & zz <= zmax) 
      "d "sndtemp"(z="zz")"
      rec=sublin(result,8)
      Sfctemp=subwrd(rec,4)
      if (abs(Sfctemp) > 130) 
        zz=zz+1
      endif
   Endwhile
   "q gr2w 50 "zz
   rec=sublin(result,1)
   SfcPlev=subwrd(rec,6)
   "d "snddewp"(z="zz")"
   rec=sublin(result,8)
   Sfcdewp=subwrd(rec,4)
   SfcThee=Thetae(Sfctemp,Sfcdewp,SfcPlev)

*----------------------------------------
* Calcula a temperatura e pressao do NCL.
*----------------------------------------

   TLcl=Templcl(Sfctemp,Sfcdewp)
   PLcl=Preslcl(Sfctemp,Sfcdewp,SfcPlev)
Endif

*-------------------------------
* Plota a trajetoria da parcela.
*-------------------------------

If (DrawPrcl = 1)
   say "Desenhando a trajetoria da parcela a partir da superficie."
   If (PageType = "Portrait")
      xloc=7.15
   Else
      xloc=6.65
   Endif
   "q w2xy 1 "PLcl
   rec=sublin(result,1)
   yloc=subwrd(rec,6)
   "set strsiz 0.1"
   If (PLcl < pmax) 
      "set string 1 l"
      "draw string "xloc" "yloc" NCL"
      "set line 1 1 1"
      "draw line "xloc-0.15" "yloc" "xloc-0.05" "yloc
   Endif
   "set lon 0 100"
   "set gxout stat"
   "set line "PrclCol" "PrclLine " " PrclThk
   PTemp=LiftDry(Sfctemp,SfcPlev,PLcl,1,pmin,pmax)
   Ptemp=LiftWet(TLcl,PLcl,pmin,1,pmin,pmax)
Endif

*--------------------------------------------------------------------
* Determina o nivel abaixo de 300mb que tem o maior valor de theta-e.
*--------------------------------------------------------------------

If (DrawTSnd = 1 & DrawDSnd = 1)
   zz=1
   MaxThee=-999
   "set gxout stat"
   while (zz <= zmax & pp > pmax-300)
       "set z "zz
       pp=subwrd(result,4)
       "d "sndtemp
       rec=sublin(result,8)
       tt=subwrd(rec,4)
       "d "snddewp
       rec=sublin(result,8)
       dd=subwrd(rec,4)
       If (tt > -900 & dd > -900) 
          Thee=Thetae(tt,dd,pp)
          If (Thee > MaxThee) 
             MaxThee=Thee
             TMaxThee=tt
             DMaxThee=dd 
             PMaxThee=pp
          Endif
       endif
       zz=zz+1
   Endwhile


say 'MaxThee= '%MaxThee

*---------------------------------------------------------------------------
* Calcula a pressao e temperatura do NCL a partir do maior nivel de theta-e.
*---------------------------------------------------------------------------

   TLclMax=Templcl(TMaxThee,DMaxThee)
   PLclMax=Preslcl(TMaxThee,DMaxThee,PMaxThee)
Endif

say 'TLclMax= '%TLclMax
say 'TMaxThee= '%TMaxThee

*---------------------------------------------------------------------
* Plota a trajetoria da parcela acima do maior nivel de theta-e a NCL.  
*---------------------------------------------------------------------

If (DrawPMax = 1)
   say "Desenhando trajetoria da parcela a partir do nivel mais instavel."
   If (PageType = "Portrait")
      xloc=7.15
   Else
      xloc=6.65
   Endif
   "q w2xy 1 "PLclMax
   rec=sublin(result,1)
   yloc=subwrd(rec,6)
   "set strsiz 0.1"
   If (PLclMax < pmax) 
      "set string 1 l"
      "draw string "xloc" "yloc" NCL"
      "set line 1 1 1"
      "draw line "xloc-0.15" "yloc" "xloc-0.05" "yloc
   Endif
   "set lon 0 100"
   "set gxout stat"
   "set line "PrclCol" "PrclLine " " PrclThk
   PTemp=LiftDry(TMaxThee,PMaxThee,PLclMax,1,pmin,pmax)
   Ptemp=LiftWet(TLclMax,PLclMax,pmin,1,pmin,pmax)
Endif

*-------------------------------------
* Apresenta os indices termodinamicos.
*-------------------------------------

If (DrawIndx = 1) 
   say "Calculando os indices termodinamicos."
   "set string 1 l"
   "set strsiz 0.10"
   "set x "xval
   "set y "yval
   "set t "tval
   pw=precipw(sndtemp,snddewp,zmin,zmax)
   Temp850=interp(sndtemp,sndtemp,850,zmax)
* say 'Temp850C= '%Temp850
   Temp700=interp(sndtemp,sndtemp,700,zmax)
* say 'Temp700C= '%Temp850
   Temp500=interp(sndtemp,sndtemp,500,zmax)
* say 'Temp500C= '%Temp850
   Dewp850=interp(snddewp,sndtemp,850,zmax)
* say 'Dewp850C= '%Temp850
   Dewp700=interp(snddewp,sndtemp,700,zmax) 
* say 'Dewp700C= '%Temp850
   Dewp500=interp(snddewp,sndtemp,500,zmax)
* say 'Dewp500C= '%Temp850
   If (Temp850>-900 & Dewp850>-900 & Dewp700>-900 & Temp700>-900 & Temp500>-900) 
      K=Temp850+Dewp850+Dewp700-Temp700-Temp500
   Else 
      K=-999
   Endif
   If (Temp850 > -900 & Dewp850 > -900 & Temp500 > -900)
      tt=Temp850+Dewp850-2*Temp500
   Else
      tt=-999
   Endif
   Temp500V=virtual2(Temp500+273.15,Dewp500+273.15,500)-273.15
   PclTemp=LiftWet(TLcl,PLcl,500,0)
   PclTempV=virtual2(PclTemp+273.15,PclTemp+273.15,500)-273.15
   SLI=Temp500V-PclTempV
   rec=CAPE(TLcl,PLcl,100,sndtemp,snddewp,zmax)
   Pos=subwrd(rec,1)
   CIN=subwrd(rec,2)

   PclTemp=LiftWet(TLclMax,PLclMax,500,0)
   PclTempV=virtual2(PclTemp+273.15,PclTemp+273.15,500)-273.15
   LIMax=Temp500V-PclTempV
   rec=CAPE(TLclMax,PLclMax,100,sndtemp,snddewp,zmax)
   PosMax=subwrd(rec,1)
   CINMax=subwrd(rec,2)
 
   If (PageType = "Portrait") 
      If (Text1XC = -1)
         Text1XC=lxloc+0.75
      Endif
      If (Text1YC = -1)
         Text1YC=tyloc-0.25
      Endif
      If (Text2XC = -1)
         Text2XC=lxloc+0.75
      Endif
      If (Text2YC = -1)
         Text2YC=tyloc-1.25
      Endif
      If (Text3XC = -1)
          Text3XC=lxloc+0.75
      Endif
      If (Text3YC = -1)
         Text3YC=tyloc-2.40
      Endif
   Else
      If (Text1XC = -1)
         Text1XC=rxloc+2.50
      Endif
      If (Text1YC = -1)
         Text1YC=tyloc-3.00
      Endif
      If (Text2XC = -1)
         Text2XC=rxloc+2.50
      Endif
      If (Text2YC = -1)
         Text2YC=tyloc-4.00
      Endif
      If (Text3XC = -1)
         Text3XC=rxloc+2.50
      Endif
      If (Text3YC = -1)
         Text3YC=tyloc-5.10
      Endif
   Endif
   "set string 1 l 3"
   "set line 0 1 3"
   "draw recf  "Text1XC-0.75 " " Text1YC-0.40 " " Text1XC+0.75 " " Text1YC+0.25
   "set line 1 1 3"
   "draw rec  "Text1XC-0.75 " " Text1YC-0.40 " " Text1XC+0.75 " " Text1YC+0.25
   "draw string "Text1XC-0.70 " " Text1YC+0.10"  K" 
   "draw string "Text1XC+0.25 " " Text1YC+0.10" " int(K)      
   "draw string "Text1XC-0.70 " " Text1YC-0.10 "  TTotals" 
   "draw string "Text1XC+0.25 " " Text1YC-0.10 " " int(tt)
   "draw string "Text1XC-0.70 " " Text1YC-0.25 "  AgPrec(cm)" 
   "draw string "Text1XC+0.25 " " Text1YC-0.25 " " int(pw*100)/100
   "set line 0 1 3"
   "draw recf  "Text2XC-0.75 " " Text2YC-0.60 " " Text2XC+0.75 " " Text2YC+0.60
   "set line 1 1 3"
   "draw rec  "Text2XC-0.75 " " Text2YC-0.60 " " Text2XC+0.75 " " Text2YC+0.60
   "draw string "Text2XC-0.35 " " Text2YC+0.50 " Superficie"
   "draw string "Text2XC-0.70 " " Text2YC+0.30 "  Temp(`3.`0C)" 
   "draw string "Text2XC+0.25 " " Text2YC+0.30 " " int(Sfctemp*10)/10
   "draw string "Text2XC-0.70 " " Text2YC+0.15 "  Td(`3.`0C)" 
   "draw string "Text2XC+0.25 " " Text2YC+0.15 " " int(Sfcdewp*10)/10
   "draw string "Text2XC-0.70 " " Text2YC "   `3z`0`bE`n(K)"
   "draw string "Text2XC+0.25 " " Text2YC " " int(SfcThee) 
   "draw string "Text2XC-0.70 " " Text2YC-0.15 "  Ind. Lev."
   "draw string "Text2XC+0.25 " " Text2YC-0.15 " " round(SLI)
   "draw string "Text2XC-0.70 " " Text2YC-0.30 "  CAPE(J)"
   "draw string "Text2XC+0.25 " " Text2YC-0.30 " " int(Pos)   
   "draw string "Text2XC-0.70 " " Text2YC-0.45 "  InibConv(J)"
   "draw string "Text2XC+0.25 " " Text2YC-0.45 " " int(CIN)      
   "set line 0 1 3"
   "draw recf  "Text3XC-0.75 " " Text3YC-0.55 " "  Text3XC+0.75 " " Text3YC+0.55
   "set line 1 1 3"
   "draw rec  "Text3XC-0.75 " " Text3YC-0.55 " "  Text3XC+0.75 " " Text3YC+0.55
   "draw string "Text3XC-0.60 " " Text3YC+0.45 " Mais Instavel"
   "draw string "Text3XC-0.70 " " Text3YC+0.20 "  Pres.(mb)" 
   "draw string "Text3XC+0.25 " " Text3YC+0.20 " " int(PMaxThee)
   "draw string "Text3XC-0.70 " " Text3YC+0.05 " `3z`0`bE`n(K)"
   "draw string "Text3XC+0.25 " " Text3YC+0.05 " " int(MaxThee)
   "draw string "Text3XC-0.70 " " Text3YC-0.10 " IndLev" 
   "draw string "Text3XC+0.25 " " Text3YC-0.10 " "round(LIMax)
   "draw string "Text3XC-0.70 " " Text3YC-0.25 " CAPE(J)" 
   "draw string "Text3XC+0.25 " " Text3YC-0.25 " "int(PosMax) 
   "draw string "Text3XC-0.70 " " Text3YC-0.40 " InibConv(J)"
   "draw string "Text3XC+0.25 " " Text3YC-0.40 " " int(CINMax) 
Endif

*-------------------------
* Desenha perfil do vento.
*-------------------------

If (DrawBarb = 1) 
   say "Plotando o perfil do vento."
   If (poleloc = -1) 
      If (PageType = "Portrait")
         poleloc = 8.0
      Else
         poleloc = 7.5 
      Endif
   Endif
   If (barbline = 1)
      "set line 1 1 3"
      "draw line "poleloc " " byloc " " poleloc " " tyloc
   Endif
   If (BarbCol = -1) 
      'set rgb 41 255 0 132'
      'set rgb 42 255 0 168'
      'set rgb 43 255 0 204'
      'set rgb 44 255 0 240'
      'set rgb 45 255 0 255'
      'set rgb 46 204 0 255'
      'set rgb 47 174 0 255'
      'set rgb 48 138 0 255'
      'set rgb 49 108 0 255'
      'set rgb 50 84 0 255'
      'set rgb 51 40 0 255'
      'set rgb 52 0 0  255'
      'set rgb 53 0 0 240'
      'set rgb 54 0 0 225'
      'set rgb 55 0 0 205'
      'set rgb 56 0 0 190'
      'set rgb 57 0 0 175'
      'set rgb 58 0 0 160'
      'set rgb 59 0 0 145'
      'set rgb 60 0 0 130' 
      'set rgb 61 0 0 115'
      'set rgb 62 0 0 100'
      'set rgb 63 255 100 0'
      'set rgb 64 255 85 0'
      'set rgb 65 255 70 0'
      'set rgb 66 255 55 0'
      'set rgb 67 255 40 0'
      'set rgb 68 255 25 0'
      'set rgb 69 255 05 0'
      'set rgb 70 240 0 0'
      'set rgb 71 225 0 0'
      'set rgb 72 210 0 0'
      'set rgb 73 200 0 0'
      'set rgb 74 185 0 0'
      'set rgb 75 170 0 0'
      'set rgb 76 155 0 0'
      'set rgb 77 140 0 0'
      'set rgb 78 125 0 0'
      'set rgb 79 110 0 0'
      'set rgb 80 95 0 0'
      'set rgb 81 80 0 0'
      'set rgb 82 70 0 0'
      'set rgb 83 60 0 0'

      col1='83 83 83 83 83 83 83 83 83 83 82 81 80 79 78'
      col2='77 76 75 74 73 72 71 70 69 68 67 66 65 64 63'
      col3='62 61 60 59 58 57 56 55 54 53 52 51 50 49 48'
      'set rbcols 'col1' 'col2' 'col3
   Endif
   "set z "zmin" "zmax
   "set gxout stat"
   zz=1
   wspd=-999
   cont=1
   While (cont = 1 & zz < zmax) 
      "set z "zz
      pres=subwrd(result,4)
      "d "sndspd
      rec=sublin(result,8)
      wspd=subwrd(rec,4)
      if (wspd < 0 | pres > pmax) 
          zz=zz+1
      else
          cont=0
      Endif
   Endwhile
   While (zz <= zmax)
      "d "sndspd"(z="zz")"
      rec=sublin(result,8)
      wspd=subwrd(rec,4)
      If (BarbCol >= 0)
         "set line "BarbCol " 1 "BarbThk
      Else
         tempbcol=55+wspd/5     
         If (tempbcol > 83) 
            tempbcol = 83
         Endif
         "set line "tempbcol " 1 "BarbThk
      Endif
      "d "snddir"(z="zz")"
      rec=sublin(result,8)
      wdir=subwrd(rec,4)
      xwind=GetUWnd(wspd,wdir)
      ywind=GetVWnd(wspd,wdir)
      "query gr2xy 5 "zz
      y1=subwrd(result,6) 
      if (wspd > 0) 
         cc=polelen/wspd
         xendpole=poleloc-xwind*cc
         yendpole=y1-ywind*cc
      endif
      if (xendpole>0 & wspd >= 0.5)
        if (flagbase = 1) 
           "draw mark 3 "poleloc " " y1 " 0.05"
        endif
        "draw line " poleloc " " y1 "  " xendpole " " yendpole
        flagloop=wspd/10
        windcount=wspd
        flagcount=0
        xflagstart=xendpole
        yflagstart=yendpole
        dx=cos((180-wdir)*_dtr)
        dy=sin((180-wdir)*_dtr)
        while (windcount > 47.5)
           flagcount=flagcount+1
           dxflag=(-len50)*dx
           dyflag=(-len50)*dy
           xflagend=xflagstart+(-dxflag)
           yflagend=yflagstart+(-dyflag)
           windcount=windcount-50
           x1=xflagstart+0.5*wid50*xwind/wspd
           y1=yflagstart+0.5*wid50*ywind/wspd
           x2=xflagstart-0.5*wid50*xwind/wspd
           y2=yflagstart-0.5*wid50*ywind/wspd
           If (Fill50 = 1) 
              "draw polyf "x1" "y1" "x2" "y2" "xflagend" "yflagend" "x1" "y1
           Else
              "draw line "x1 " "y1 " " xflagend " " yflagend " "  
              "draw line "x2 " "y2 " " xflagend " " yflagend
              "draw line "x1 " "y1 " " x2 " " y2
           Endif
           xflagstart=xflagstart+spac50*xwind/wspd
           yflagstart=yflagstart+spac50*ywind/wspd
        endwhile
        while (windcount > 7.5 ) 
           flagcount=flagcount+1
           dxflag=(-len10)*dx
           dyflag=(-len10)*dy
           xflagend=xflagstart+(-dxflag)
           yflagend=yflagstart+(-dyflag)
           windcount=windcount-10
           "draw line " xflagstart " " yflagstart " " xflagend " " yflagend
           xflagstart=xflagstart+spac10*xwind/wspd
           yflagstart=yflagstart+spac10*ywind/wspd
        endwhile
        if (windcount > 2.5) 
           flagcount=flagcount+1
           if (flagcount = 1) 
              xflagstart=xflagstart+spac05*xwind/wspd
              yflagstart=yflagstart+spac05*ywind/wspd
           endif
           dxflag=(-len05)*dx
           dyflag=(-len05)*dy
           xflagend=xflagstart+(-dxflag)
           yflagend=yflagstart+(-dyflag)
           windcount=windcount-5
           "draw line " xflagstart " " yflagstart " " xflagend " " yflagend
        endif
      else
        if (wspd < 0.5 & wspd >= 0) 
           "draw mark 2 " poleloc " " y1 " 0.08"
        endif
      endif
      zz=zz+barbint
   endwhile
Endif

*-------------------
* Desenha Hodografo.
*-------------------

If (DrawHodo = 1)
   say "Desenhando o hodografo."

   If (HodXcent = -1 | HodYcent = -1) 
      If (PageType = "Portrait") 
         HodXcent=6
         HodYcent=9.5
      Else
         HodXcent=9
         HodYcent=7.0
      Endif
   Endif
   HodL=HodXcent-HodSize/2.0
   HodR=HodXcent+HodSize/2.0
   HodT=HodYcent+HodSize/2.0
   HodB=HodYcent-HodSize/2.0
   RingSpac=HodSize/(NumRing*2)
   "set line 0"
   "draw recf "HodL" "HodB" "HodR" "HodT
   "set line "HodoCol" 1 6"
   "draw rec "HodL" "HodB" "HodR" "HodT
   "set line 1 1 3"
   "set string 1 c"
   "draw mark 1 "HodXcent " "HodYcent " " HodSize
   i=1
   While (i <= NumRing)
     "set strsiz 0.10"
     "set string 1 c 3 45"
     uwnd=-i*HodRing*cos(45*_dtr)
     xloc=HodXcent+uwnd*RingSpac/HodRing
     yloc=HodYcent+uwnd*RingSpac/HodRing
  
     "draw mark 2 "HodXcent " " HodYcent " " i*HodSize/NumRing
*     "draw string "HodXcent+0.02-0.5*i*HodSize/NumRing " "HodYcent-0.08 " "HodRing*i
      "draw string "xloc " " yloc " " HodRing*i
     i=i+1
   Endwhile
   "set string 1 l 3 0"
   If (TickInt > 0) 
      i=0
      while (i < HodRing*NumRing) 
         dist=i*RingSpac/HodRing
         hrxloc=HodXcent+dist                
         hlxloc=HodXcent-dist                      
         htyloc=HodYcent+dist
         hbyloc=HodYcent-dist
         "set line 1 1 3"
         "draw line "hrxloc " " HodYcent-TickSize/2 " " hrxloc " " HodYcent+TickSize/2
         "draw line "hlxloc " " HodYcent-TickSize/2 " " hlxloc " " HodYcent+TickSize/2
         "draw line "HodXcent+TickSize/2 " " htyloc " " HodXcent-TickSize/2 " " htyloc
         "draw line "HodXcent+TickSize/2 " " hbyloc " " HodXcent-TickSize/2 " " hbyloc
         i=i+TickInt
      endwhile
   Endif
   "set line "HodoCol " " HodoLine " "HodoThk
   "draw string "HodL+0.05 " " HodT-0.1 " (kt)"
   zloop=zmin
   xold=-999
   yold=-999
   count=0
   Depth=0
   While (zloop < zmax & Depth < HodoDep)
      "set z "zloop
      pres=subwrd(result,4)
      "d "sndspd
      rec=sublin(result,8)
      wspd=subwrd(rec,4)
      "d "snddir
      rec=sublin(result,8)
      wdir=subwrd(rec,4)
      uwnd=GetUWnd(wspd,wdir)
      vwnd=GetVWnd(wspd,wdir)
      If (wspd >= 0) 
         xloc=HodXcent+uwnd*RingSpac/HodRing
         yloc=HodYcent+vwnd*RingSpac/HodRing
         If (xloc > 0 & yloc > 0 & xold > 0 & yold > 0) 
            Depth=Depth+pold-pres
            count=count+1
            If (count = 1) 
               "draw mark 3 "xold " " yold " 0.05"
            Endif
            "draw line "xold" "yold" "xloc" "yloc
         Endif
         xold=xloc
         yold=yloc
      Endif
      zloop=zloop+1
      pold=pres
   EndWhile

   If (count > 0) 
      "draw mark 3 "xold " " yold " 0.05"
   Endif
Endif

*-------------------------------------------
* Calcula e exibe helicidade absoluta e S-R.
*-------------------------------------------

If (DrawHeli = 1) 
   say "Calculando helicidade absoluta e S-R."
   pold=-9999
   zloop=zmin
   UTotal=0
   VTotal=0
   WgtTotal=0

*-------------------------------------------------------------
* Em primeiro lugar, calcula o vento medio da massa ponderada.
*------------------------------------------------------------- 

   While (zloop <= zmax)
      "set z "zloop
      pres=subwrd(result,4)
      "d "sndspd
      rec=sublin(result,8)
      wspd=subwrd(rec,4)
      "d "snddir
      rec=sublin(result,8)
      wdir=subwrd(rec,4)
      uwnd=GetUWnd(wspd,wdir)*_ktm
      vwnd=GetVWnd(wspd,wdir)*_ktm
      If (pold > 0 & pres >= MeanVTop & pres <= MeanVBot & uwnd > -900 & vwnd > -900) 
         weight=log(pold/pres)
         WgtTotal=WgtTotal+weight
         UTotal=UTotal+weight*uwnd
         VTotal=VTotal+weight*vwnd
      Endif
      zloop=zloop+1
      pold=pres
   EndWhile
* paulotak 980813
* if para zerar vento medio quando nao tiver ventos suficientes 
   if (WgtTotal=0) 
   say "WgtTota=0 => Umean,Vmean,Spdmean==0 !"
   Umean=0; Vmean=0; Spdmean=0;
   else
   Umean=UTotal/WgtTotal
   Vmean=VTotal/WgtTotal
   Spdmean=GetWSpd(UTotal/WgtTotal,VTotal/WgtTotal)
   endif

   MeanDir=GetWDir(Umean,Vmean)

*-----------------------------------------------------
* Agora, rotaciona e reduz o vento medio referido para 
* obter o deslocamento da tempestade.
*-----------------------------------------------------

   If (StormMot = 1) 
      If (Spdmean < 15) 
         Reduct=0.25
         Rotate=30
      Else
         Reduct=0.20
         Rotate=20
      Endif
   Else
      Reduct=0.0
      Rotate=0.0
   Endif

   UReduce=(1-Reduct)*Umean
   VReduce=(1-Reduct)*Vmean
   StormSpd=GetWSpd(UReduce,VReduce)

   StormDir=GetWDir(UReduce,VReduce)+Rotate
   If (StormDir >= 360) 
      StormDir=StormDir-360
   Endif

   StormU=GetUWnd(StormSpd,StormDir)
   StormV=GetVWnd(StormSpd,StormDir)

*----------------------------------------------
* Apresenta o vetor deslocamento da tempestade.
*----------------------------------------------

   xloc=HodXcent+_mtk*StormU*RingSpac/HodRing
   yloc=HodYcent+_mtk*StormV*RingSpac/HodRing

   "set line 1 1 4"
   "draw line "HodXcent " " HodYcent " " xloc " " yloc
   Arr1U=GetUWnd(HodRing/10,StormDir+30)
   Arr1V=GetVWnd(HodRing/10,StormDir+30)
   Arr2U=GetUWnd(HodRing/10,StormDir-30)
   Arr2V=GetVWnd(HodRing/10,StormDir-30)

   xloc2=xloc-Arr1U/HodRing
   xloc3=xloc-Arr2U/HodRing
   yloc2=yloc-Arr1V/HodRing
   yloc3=yloc-Arr2V/HodRing

   "set line 1 1 3"

   If (FillArrw = 0) 
      "draw line "xloc" "yloc" "xloc2" "yloc2
      "draw line "xloc" "yloc" "xloc3" "yloc3
   Else
      "draw polyf "xloc" "yloc" "xloc2" "yloc2" "xloc3" "yloc3" "xloc" "yloc
   Endif

 
   say "     Vento medio   :  " Spdmean  " m/s  " MeanDir  " graus"
   say "     Deslocamento da tempestade:  " StormSpd " m/s  " StormDir " graus"

*-----------------------------------------------
* Agora, calcula as helicidades S-R e ambiental.
*-----------------------------------------------

   zloop=1             
   uwindold=-9999
   vwindold=-9999
   helic=0
   SRhelic=0
   Depth=0
   While (zloop <= zmax & Depth <= HelicDep)
      "set z "zloop
      pres=subwrd(result,4)
      "d "sndspd
      rec=sublin(result,8)
      wspd=subwrd(rec,4)
      "d "snddir
      rec=sublin(result,8)
      wdir=subwrd(rec,4)
      uwind=GetUWnd(wspd,wdir)*_ktm
      vwind=GetVWnd(wspd,wdir)*_ktm
      If (uwind > -900 & uwindold > -900)
          Depth=Depth+pold-pres
          du=uwind-uwindold
          dv=vwind-vwindold
          ubar=0.5*(uwind+uwindold)
          vbar=0.5*(vwind+vwindold)
          uhelic=-dv*ubar                   
          vhelic=du*vbar                   
          SRuhelic=-dv*(ubar-StormU)
          SRvhelic=du*(vbar-StormV)
          SRhelic=SRhelic+SRuhelic+SRvhelic
          helic=helic+uhelic+vhelic
      Endif
      zloop=zloop+1
      uwindold=uwind
      vwindold=vwind
      pold=pres
   EndWhile

   "set strsiz 0.1"
   "set string 1 l 3"
   If (PageType = "Portrait") 
      If (Text4XC = -1)
         Text4XC=lxloc+0.75
      Endif
      If (Text4YC = -1) 
         Text4YC=tyloc-3.45
      Endif
   Else
      If (Text4XC = -1)
         Text4XC=rxloc+2.50
      Endif
      If (Text4YC = -1)
         Text4YC=tyloc-6.10
      Endif
   Endif
   "set line 0 1 3"
   "draw recf  "Text4XC-0.75 " "Text4YC-0.5 " " Text4XC+0.75 " " Text4YC+0.5
   "set line 1 1 3"
   "draw rec  "Text4XC-0.75 " "Text4YC-0.5 " " Text4XC+0.75 " " Text4YC+0.5
   "draw string "Text4XC-0.45 " " Text4YC+0.40 " Hodografo"
   "draw string "Text4XC-0.70 " " Text4YC+0.20 " EH"
   "draw string "Text4XC+0.25 " " Text4YC+0.20 " "int(helic)
   "draw string "Text4XC-0.70 " " Text4YC+0.05 " SREH"
   "draw string "Text4XC+0.25 " " Text4YC+0.05 " " int(SRhelic)
   "draw string "Text4XC-0.70 " " Text4YC-0.20 " DirTmpt"
   "draw string "Text4XC+0.25 " " Text4YC-0.20 " " int(StormDir)"`3.`0"
   "draw string "Text4XC-0.70 " " Text4YC-0.35 " VelTmpt(kt)"
   "draw string "Text4XC+0.25 " " Text4YC-0.35 " " int(_mtk*StormSpd)
Endif

*---------------------------------------------
* Reinicia as dimensoes originais do ambiente.
*---------------------------------------------

"set t "tval
"set x "xval 
"set y "yval 
"set z "zmin " "zmax

say "Fim."

Return

*************************************************************************
function Templcl(temp,dewp)

*------------------------------
* Calcula a temperatura em NCL.
*------------------------------

tempk=temp+273.15
dewpk=dewp+273.15
Parta=1/(dewpk-56)
Partb=log(tempk/dewpk)/800
Tlcl=1/(Parta+Partb)+56
return(Tlcl-273.15)

**************************************************************************

function Preslcl(temp,dewp,pres)

*--------------------------
* Calcula a pressao em NCL.
*--------------------------

Tlclk=Templcl(temp,dewp)+273.15
tempk=temp+273.15
theta=tempk*pow(1000/pres,0.286)
plcl=1000*pow(Tlclk/theta,3.48)
return(plcl)

**************************************************************************
function LiftWet(startt,startp,endp,display,Pmin,Pmax)

*-----------------------------------------------------------------
* Levanta a parcela adiabaticament umida.
* Se voce deseja ver a trajetoria da parcela exibida, o valor de 
* "display" deve ser 1. Retorna a temperatura da parcela ao final.
*-----------------------------------------------------------------

temp=startt
pres=startp
cont = 1
delp=10
While (pres >= endp & cont = 1) 
    If (display = 1) 
       xtemp=GetXLoc(temp,pres)
       "q w2xy "xtemp" "pres
       xloc=subwrd(result,3)
       yloc=subwrd(result,6)
       If (xtemp < 0 | xtemp > 100)
          cont=0
       Else
          If (pres >= Pmin & pres < Pmax & pres < startp)  
             "draw line "xold" "yold" "xloc" "yloc 
          Endif
       Endif
    Endif
    pres=pres-delp
    xold=xloc
    yold=yloc
    lapse=gammaw(temp,pres,100)
    temp=temp-100*delp*lapse                  
EndWhile
return(temp)


**************************************************************************
function LiftDry(startt,startp,endp,display,Pmin,Pmax)

*---------------------------------------------------------------
* Levanta a parcela adiabaticamente seca.
* Caso queira a trajetoria da parcela exibida, o valor de 
* "display" deve ser 1. Retorna temperatura da parcela ao final.
*---------------------------------------------------------------

starttk=startt+273.15
cont = 1
delp=10
round=int(startp/10)*10
subscr=0.1*round
powstart=pow(startp,-0.286)
temp=starttk*_powpres.subscr*powstart-273.15
pres=round-10
While (pres >= endp & cont = 1) 
    subscr=0.1*pres
    temp=starttk*_powpres.subscr*powstart-273.15
    If (display = 1) 
       xtemp=GetXLoc(temp,pres)
       "q w2xy "xtemp" "pres
       xloc=subwrd(result,3)
       yloc=subwrd(result,6)
       If (xtempold > 0 & xtempold < 100 & xtemp > 0 & xtemp < 100) 
          If (pres >= Pmin & pres < Pmax & pres < startp)  
             "draw line "xold" "yold" "xloc" "yloc 
          Endif
       Endif
    Endif
    xold=xloc
    xtempold=xtemp
    yold=yloc
    pres=pres-delp
EndWhile
return(temp)

**************************************************************************
function CAPE(startt,startp,endp,sndtemp,snddewp,zmax)

*---------------------------------------------------------------------
* Retorna toda a area positiva acima do NCL e a inibicao da conveccao.
* Parcela e levantada do NCL com temperatura e pressao iniciais e e
* bloqueada ao final
*---------------------------------------------------------------------

PclTemp=startt
pres=startp
cont = 1
delp=10
Pos=0
Neg=0
Neg2=0

While (pres >= endp & cont = 1)
   EnvTemp=interp(sndtemp,sndtemp,pres,zmax)
* say 'EnvTemp= '%EnvTemp
   EnvDewp=interp(snddewp,sndtemp,pres,zmax)
* say 'EnvDewp= '%EnvDewp
   EnvTempV=virtual2(EnvTemp+273.15,EnvDewp+273.15,pres)-273.15
   PclTemp=PclTemp-100*delp*gammaw(PclTemp,pres,100)  
   PclTempV=virtual2(PclTemp+273.15,PclTemp+273.15,pres)-273.15
   Val=(287*log(pres/(pres-delp))*(PclTempV-EnvTempV))
   If (abs(EnvTemp) < 130 & abs(PclTemp) < 130) 
      If (Val > 0) 
         Pos=Pos+Val
         Neg2=0
      Else
         Neg=Neg+abs(Val)
         Neg2=Neg2+abs(Val)
      Endif
   Endif
   pres=pres-delp
Endwhile

CIN=Neg-Neg2

return(Pos" "CIN)

***************************************************************************
function gammaw(tempc,pres,rh)

*----------------------------------------------------------------------
* Funcao que calcula a TVVT da adiabatica umida (graus C/Pa) baseada na
* temperatura, presao e umidade relativa do ambiente.
*----------------------------------------------------------------------

tempk=tempc+273.15
* say 'entrando no satvap2 do gammaw(tempc= '%tempc%', pres= '%pres%',rh= '%rh%')'
es=satvap2(tempc)
ws=mixratio(es,pres)
w=rh*ws/100
tempv=virtual(tempk,w)

A=1.0+_D1*ws/(287*tempk)
B=1.0+0.622*_D1*_D1*ws/(1004*287*tempk*tempk)
Density=100*pres/(287*tempv)
lapse=(A/B)/(1004*Density)
return(lapse)

*************************************************************************

function precipw(sndtemp,snddewp,zmin,zmax)

*---------------------------------------------------------
* Funcao que calcula a agua precipitavel (cm) na sondagem.
*---------------------------------------------------------

zz=zmin
ppold=-9999
ttold=-9999
ddold=-9999
"set gxout stat"
Int=0
mix=0 
while (zz <= zmax)
   "set z "zz
   pp=subwrd(result,4)
   "d "sndtemp
   rec=sublin(result,8)
   tt=subwrd(rec,4)
   "d "snddewp
   rec=sublin(result,8)
   dd=subwrd(rec,4)
   if (tt>-900 & ttold>-900 & dd>-900 & ddold>-900) 
* say 'entrando no satvap2 do precipw(sndtemp= '%sndtemp%', snddwewp= '%snddewp%')'
      e=satvap2(dd)
      mix=mixratio(e,pp)
      mixavg=(log(pp)*mix+log(ppold)*mixold)/(log(pp)+log(ppold))
      dp=ppold-pp
      Int=Int+1000*mixavg*dp/980
   endif
   ttold=tt
   ddold=dd
   ppold=pp
   mixold=mix
   zz=zz+1
endwhile

return(Int)

*************************************************************************

function virtual(temp,mix)

*-----------------------------------------------------------------------
* Funcao que retorna a temperatura virtual, dadas a temperatura em K e a 
* razao de mistura em g/g
*-----------------------------------------------------------------------

tempv=temp*(1.0+0.6*mix)

return (tempv)

************************************************************************

function virtual2(temp,dewp,pres)
  
*--------------------------------------------------------------------------
* Funcao que retorna a temperatura virtual em K, dadas a temperatura (K), a
* temperatura do ponto de orvalho (K) e a pressao (mb).
*--------------------------------------------------------------------------

*  say 'entrando no satvap2 do virtual2(temp= '%temp%', dewp= '%dewp%')'
* paulotak 980813
* bug !!!!!!! - estava passando temp em K para formula de Tetens em alguns casos
vap=satvap2(dewp-273.15)
mix=mixratio(vap,pres)
 
tempv=virtual(temp,mix)
  
return (tempv)
  
************************************************************************

function satvapor(temp)

*-----------------------------------------------------------------------------
* Dada a temperatura em Celsius, retorna a pressao de vapor de saturacao (mb).
*-----------------------------------------------------------------------------

pol=_C0+temp*(_C1+temp*(_C2+temp*(_C3+temp*(_C4+temp*(_C5+temp*(_C6+temp*(_C7+temp*(_C8+temp*(_C9)))))))))

return(6.1078/pow(pol,8))

************************************************************************

function satvap2(temp)

*-----------------------------------------------------------------------------
* Dada a temperatura em Celsius, retorna a pressao de vapor de saturacao (mb).
*-----------------------------------------------------------------------------

*  say 'temp= '%temp
 if (temp < -120.0)
  es = 1.0e-07
 else
  es=6.112*exp(17.67*temp/(temp+243.5))
 endif
*  say 'es= '%es

return(es)

*************************************************************************

function mixratio(e,p)

*-----------------------------------------------------------------
* Dada a pressao de vapor e a pressao, retorna a razao de mistura.
*-----------------------------------------------------------------

mix=0.622*e/(p-e)

return(mix)

************************************************************************

function getrh(temp,dewp,pres)

tempk=temp+273.15
dewpk=dewp+273.15

*  say 'entrando no satvap2 do getrh(temp= '%temp%', dewp= '%dewp%')'
es=satvap2(temp)

If (temp > 0) 
   A=2.53*pow(10,9)
   B=5420
Else
   A=3.41*pow(10,10)
   B=6130
Endif

w=A*0.622*exp(-B/dewpk)/pres
ws=mixratio(es,pres)

return(100*w/ws)

************************************************************************

function interp(array,temparr,pres,zmax)

*-----------------------------------------------------------------
* Interpola a distribuicao interna dos niveis de pressao presente.
* Retorna o valor estimado da distribuicao da pressao presente.
*------------------------------------------------------------------------

"set lev "pres
altpres=subwrd(result,4)
"q dims"
rec=sublin(result,4)
zlev=subwrd(rec,9)

If (altpres > pres) 
   zmin=zlev+1
Else
   zmin=zlev
Endif
 
"set z "zmin
PAbove=subwrd(result,4)
"d "array"(lev="PAbove")"
rec=sublin(result,8)
VAbove=subwrd(rec,4)
"d "temparr"(lev="PAbove")"
rec=sublin(result,8)
TAbove=subwrd(rec,4)
"set z "zmin-1
PBelow=subwrd(result,4)
"d "array"(lev="PBelow")"
rec=sublin(result,8)
VBelow=subwrd(rec,4)
"d "temparr"(lev="PBelow")"
rec=sublin(result,8)
TBelow=subwrd(rec,4)

*If (abs(TAbove) < 130 & abs(TBelow) < 130 & zmin < zmax) 
If (abs(TAbove) < 130 & abs(TBelow) < 130 & abs(TBelow) > 0 & zmin < zmax) 
    found = 1
Else
    found = 0
Endif
       
If (found = 1)
   MeanT=(log10(PAbove)*TAbove+log10(PBelow)*TBelow)/(log10(PAbove*PBelow))
   LayerD=287*MeanT*log(PBelow/PAbove)/9.8
   DZ=287*MeanT*log(PBelow/pres)/9.8
   Vest=VBelow+DZ*(VAbove-VBelow)/LayerD
Else  
   Vest=-9999.0
Endif

Return(Vest)

****************************************************************************

function GetUWnd(wspd,wdir)

*---------------------------------
* Fornece a componente x do vento. 
*---------------------------------


If (wspd > 0) 
   xwind=wspd*cos((270-wdir)*_dtr)
Else
   xwind = -9999.0
Endif
return(xwind)

**************************************************************************

function GetVWnd(wspd,wdir)

*---------------------------------
* Fornece a componente y do vento.
*---------------------------------

If (wspd > 0) 
   ywind=wspd*sin((270-wdir)*_dtr)
Else
   ywind = -9999.0
Endif
return(ywind)


*************************************************************************

function GetWSpd(xwind,ywind)


"set gxout stat"
"d mag("xwind","ywind")"
rec=sublin(result,8)
val=subwrd(rec,4)

return (val)

*************************************************************************

function GetWDir(xwind,ywind)

* -------------------------------------------------------
* Retorna a direcao do vento, dadas as componentes x e y.
* -------------------------------------------------------

"set gxout stat"
"define theta=270-"_rtd"*atan2("ywind","xwind")"
"d theta"
rec=sublin(result,8)
Dir=subwrd(rec,4)

If (Dir > 360)
   Dir=Dir-360
Endif

If (Dir < 0)
   Dir=360+Dir
Endif

return(Dir)

*************************************************************************

function GetXLoc(temp,pres)

*----------------------------------------------------------------------------
* Fornece a posicao x no diagrama skewT, baseada na pressao e na temperatura.
*----------------------------------------------------------------------------

xloc=(temp-_m1*log10(pres)-_m3)/_m2
return(xloc)

*************************************************************************
 
function GetTemp(xloc,pres) 

*-------------------------------------------------------------------------
* Retorna a temperatura na localizacao dada pela posicao x e pela pressao.
*-------------------------------------------------------------------------

tempval=_m1*log10(pres)+_m2*xloc+_m3
return(tempval)

**************************************************************************

function GetTheta(temp,pres)         

*------------------------------------------------
* Calcula theta para dadas pressao e temperatura.
*------------------------------------------------

theta=(temp+273.15)*pow(1000/pres,0.286)-273.15
return(theta)


*************************************************************************

function GetThet2(temp,dewp,pres)         

*---------------------------------------------------------------------------------
* Calcula theta para dadas temperatura, temperatura do ponto de orvalho e pressao.
*---------------------------------------------------------------------------------

tempk=273.15+temp
dewpk=273.15+dewp

* say 'entrando no satvap2 do gethet2(temp= '%temp%', dewp= '%dewp%')'
es=satvap2(temp)
ws=mixratio(es,pres)

mix=10*getrh(temp,dewp,pres)*ws

exponent=0.2854*(1.0-0.00028*mix)
theta=(temp+273.15)*pow(1000/pres,exponent)-273.15
return(theta)

*************************************************************************

function Thetae(temp,dewp,pres)

*------------------------------------------------------------------
* Retorna a temperatura potencial equivalente (K) dadas temperatura
* e temperatura do ponto de orvalho (em Celsius).
*------------------------------------------------------------------
*paulotak 990419
* say 'entrando no satvap2 do thetae(temp= '%temp%', dewp= '%dewp%')'
es=satvap2(temp)
*  say 'es= '%es
ws=mixratio(es,pres)
*  say 'ws= '%ws
mix=10*getrh(temp,dewp,pres)*ws
*  say 'mix= '%mix
theta=GetThet2(temp,dewp,pres)+273.15
*  say 'theta= '%theta
TLcl=Templcl(temp,dewp)+273.15
*  say 'TLcl= '%TLcl
thetae=theta*exp((3.376/TLcl-0.00254)*mix*1.0+0.00081*mix)
*  say 'thetae= '%thetae

return(thetae)

**************************************************************************


function int(i0)

*--------------------------
* Retorna a integral de i0.
*--------------------------
  i=0
  while(i<12)
    i=i+1
    if(substr(i0,i,1)='.')
      i0=substr(i0,1,i-1)
      break
    endif
  endwhile
return(i0)

*************************************************************************

function abs(i)

*-------------------------------
* Retorna o valor absoluto de i.
*-------------------------------

  if (i < 0) 
     absval=-i
  else 
     absval=i
  endif

return(absval)

*************************************************************************

function log(i)

*----------------------------------
* Retorna o logaritmo natural de i.
*----------------------------------

"set gxout stat"
"d log("i")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

*************************************************************************

function log10(i)

*-------------------------------------
* Retorna o logaritmo na base 10 de i.
*-------------------------------------

"set gxout stat"
"d log10("i")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

*************************************************************************

function pow(i,j)

*------------------------------------
* Dados i e j, retorna i elevado a j.
*------------------------------------

"set gxout stat"
"d pow("i","j")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

************************************************************************

function cos(i)

*-------------------------------------------
* Dado i em radianos, retorna o cosseno de i.
*--------------------------------------------

"set gxout stat"
"d cos("i")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

************************************************************************

function sin(i)

*------------------------------------
* retorna o seno de i, i em radianos.
*------------------------------------

"set gxout stat"
"d sin("i")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

************************************************************************

function exp(i)

*------------------------------------------
* Retorna a exponencial de i
*------------------------------------------

"set gxout stat"
"d exp("i")"
rec=sublin(result,8)
val=subwrd(rec,4)
return(val)

***********************************************************************
function round(i)

rr=abs(1.0*i)
rr=int(rr+0.5)
if (i < 0)
   rr=-1*rr      
endif
return(rr)

***********************************************************************

function meses(mes)
   if (mes = 1);mois='jan';endif
   if (mes = 2);mois='fev';endif
   if (mes = 3);mois='mar';endif
   if (mes = 4);mois='abr';endif
   if (mes = 5);mois='mai';endif
   if (mes = 6);mois='jun';endif
   if (mes = 7);mois='jul';endif
   if (mes = 8);mois='ago';endif
   if (mes = 9);mois='set';endif
   if (mes =10);mois='out';endif
   if (mes =11);mois='nov';endif
   if (mes =12);mois='dez';endif
return (mois)

* FIM!!!
