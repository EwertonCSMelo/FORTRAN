C                                                                       BH 00060
C PROGRAMA DO BALANCO HIDRICO                                           BH 00070
C PARAMETROS DE ENTRADA                                                 BH 00080
C NOME DA CIDADE,SIGLA DO ESTADO                                        BH 00090
C LATITUDE(LATH-GRAUS,LATM-MINUTOS,LATS-SEGUNDOS)                       BH 00100
C DIR1-DIRECAO                                                          BH 00110
C LONGITUDE(LONGG-GRAUS,LONGM-MINUTOS,LONGS-SEGUNDOS)                   BH 00120
C DIR2-DIRECAO                                                          BH 00130
C ALTITUDE                                                              BH 00140
C PERIODO DE ABRANGENCIA DOS DADOS                                      BH 00150
C NUMERO DE LAMINAS E CAPACIDADE DE ARMAZENAMENTO DESSAS LAMINAS        BH 00160
C 12 VALORES DE TEMPERATURA (TEMP) E PRECIPITACAO (PREC) CORRESPONDENTESBH 00170
C AOS MESES DE JANEIRO A DEZEMBRO                                       BH 00180
C                                                                       BH 00190
       FUNCTION INTRO(XREAL)                                            BH 00200
       IS=1                                                             BH 00210
       IF(XREAL-0)4,5,5                                                 BH 00220
4      IS=-1                                                            BH 00230
       XREAL=ABS(XREAL)                                                 BH 00240
5      NINT=XREAL                                                       BH 00250
       XRESTO=XREAL-NINT                                                BH 00260
       IF(XRESTO-0.5)3,1,2                                              BH 00270
1      IF(NINT-((NINT/2)*2))2,3,2                                       BH 00280
2      NINT=NINT+1                                                      BH 00290
3      INTRO=NINT*IS                                                    BH 00300
       RETURN                                                           BH 00310
       END                                                              BH 00320
      REAL TEMP(12),PREC(12),IIL,IMC(12),E(12),C(12),LATR,SOMAP(6)      BH 00330
      INTEGER NOME(20),DIR1,DIR2,ANO1,ANO2,CA(2),ILIGA(12),DIF(12),     BH 00340
     *        NACM(12),ARMZ(12),ALT(12),EI(12),DEF(12),EXC(12),EP(12),  BH 00350
     *        PPC,ULTMP(6),CONTR,CONNEG,AP1,AP,SALT,SER,SDEF,SEXC,SEP,  BH 00360
     *        SDIF,TNEG,HEMI(2),FF,SPREC
      CHARACTER*50 INFILEP,INFILET,OUTFILE                              BH 00370
      DIMENSION TABT(18),TABE(18),B(2),ND(12),TAND(12),MES(12),         BH 00380
     *          ITABCA(2),ER(12)                                        BH 00390
      DATA ISUL/'S'/                                                    BH 00400
      DATA INORTE/'N'/                                                  BH 00410
      DATA TABT/26.6,27.0,27.3,27.7,28.0,28.4,28.8,29.3,29.7,30.2,      BH 00420
     *          30.7,31.2,31.8,32.5,33.3,34.3,36.1,99.9/                BH 00430
      DATA TABE/4.5,4.6,4.7,4.8,4.9,5.0,5.1,5.2,5.3,5.4,5.5,5.6,5.7,    BH 00440
     *          5.8,5.9,6.0,6.1,6.2/                                    BH 00450
               DATA B/0.010250,0.004036/                                        
      DATA ND/31,28,31,30,31,30,31,31,30,31,30,31/                      BH 00480
      DATA TAND/-0.37110,-0.23731,-0.03917,0.17663,0.32685,0.41660,     BH 00490
     *            0.38503,0.24825,0.05664,-0.14095,-0.32042,-0.41387/   BH 00500
          DATA ITABCA/100,250/                                                  
      DATA MES/'JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET',   BH 00520
     *'OUT','NOV','DEZ'/                                                BH 00530
       DATA IWW/'W'/   
       WRITE (*,*)'ABRIR ARQUIVO COM DADOS DE PRECIPITACAO' 
       READ (*,5000) INFILEP                                                
       OPEN(5,FILE=INFILEP,STATUS='OLD')   
5000   FORMAT (A50) 
       
       WRITE (*,*)'ABRIR ARQUIVO COM DADOS DE TEMPERATURA' 
       READ (*,5005) INFILET                                                
       OPEN(5,FILE=INFILET,STATUS='OLD')   
5005   FORMAT (A50) 
       
       WRITE (*,*) 'SALVAR COMO'
       READ (*,5000) OUTFILE
       OPEN(6,FILE=OUTFILE,STATUS='unknown')
       DO 2021 III=1,6                                                  BH 00550
       HEMI(1)=INORTE                                                   BH 00560
       HEMI(2)=ISUL                                                     BH 00570
       DIR2=IWW                                                         BH 00580
c      READ(5,1003)(NOME(J),J=1,20),LATH,LATM,LONGG,LONGM,ALTIT          BH 00590
c1003  FORMAT(20A1,2I2,1X,2I2,1X,F6.1)                                   BH 00600
c      READ(5,*)PREC(I),I=1,12)                                     BH 00630
c1005  FORMAT(12(F5.1,1X))                                               BH 00640
c      READ(5,*)(TEMP(I),I=1,12)                                              
c5554  FORMAT(12(F5.1,1X))
      DO I=1,12
      READ(5,*)PREC(I), TEMP(I)                                      
      END DO                                                  
      DIR1=2                                                            BH 00650
       LATS=0                                                           BH 00660
       LONGS=0                                                          BH 00670
       NLAM=2                                                           BH 00680
       CA(1)=100                                                        BH 00690
       CA(2)=250                                                        BH 00700
      TNEG=0                                                            BH 00770
      IAC=0                                                             BH 00780
      DO 3 I=1,12                                                       BH 00790
      IMC(I)=(TEMP(I)/5.)**1.514                                        BH 00800
      IAC=IAC+INTRO(IMC(I))                                             BH 00810
3     CONTINUE                                                          BH 00820
      A=(((0.675*IAC-77.1)*IAC+17920.)*IAC+492390.)*0.000001            BH 00830
      LATR=((LATH*60.+LATM)*60.+LATS)*4.8481*0.000001                   BH 00840
312   DO 9 I=1,12                                                       BH 00850
      IF(TEMP(I)-26.5)4,4,5                                             BH 00860
4     E(I)=0.533*(10.*TEMP(I)/IAC)**A                                   BH 00870
       GO TO 83                                                         BH 00880
5      DO 7 K=1,18                                                      BH 00890
      IF(TEMP(I)-TABT(K))6,6,7                                          BH 00900
6     E(I)=TABE(K)                                                      BH 00910
       GO TO 83                                                         BH 00920
7     CONTINUE                                                          BH 00930
83    C(I)=ACOS(-TAN(-LATR)*(TAND(I)))+0.0145                           BH 00940
       C(I)=C(I)*180*ND(I)/(90*3.14159)                                 BH 00950
      T=E(I)*C(I)                                                       BH 00960
      EP(I)=INTRO(T)                                                    BH 00970
      DIFR=PREC(I)-EP(I)                                                BH 00980
      DIF(I)=INTRO(DIFR)                                                BH 00990
9     CONTINUE                                                          BH 01000
      DO 10 I=1,11                                                      BH 01010
      ILIGA(I)=I+1                                                      BH 01020
10    CONTINUE                                                          BH 01030
      ILIGA(12)=1                                                       BH 01040
      INEG=0                                                            BH 01050
      IPOS=0                                                            BH 01060
      DO 13 I=1,12                                                      BH 01070
      IF(DIF(I)-0)11,11,12                                              BH 01080
11    INEG=1                                                            BH 01090
      GO TO 13                                                          BH 01100
12    IPOS=1                                                            BH 01110
13    CONTINUE                                                          BH 01120
      IF(INEG-0)14,20,14                                                BH 01130
14    IF(IPOS-0)15,23,15                                                BH 01140
15    ICABE=2                                                           BH 01150
      IFIM=1                                                            BH 01160
16    IF(DIF(ICABE)-0)17,17,18                                          BH 01170
17    IF(DIF(IFIM)-0)18,18,19                                           BH 01180
18    IFIM=ICABE                                                        BH 01190
      ICABE=ILIGA(ICABE)                                                BH 01200
      GO TO 16                                                          BH 01210
19    IFIM=ICABE                                                        BH 01220
      GO TO 25                                                          BH 01230
20    K=1                                                               BH 01240
      DO 22 I=2,12                                                      BH 01250
      IF(DIF(I)-DIF(K))22,22,21                                         BH 01260
21    K=I                                                               BH 01270
22    CONTINUE                                                          BH 01280
      GO TO 37                                                          BH 01290
23    DO 24 I=1,12                                                      BH 01300
       NACM(I)=0                                                        BH 01310
      ARMZ(I)=0                                                         BH 01320
      ALT(I)=0                                                          BH 01330
      EXC(I)=0                                                          BH 01340
      ER(I)=INTRO(PREC(I))                                                      
      DEF(I)=-DIF(I)                                                    BH 01360
24    CONTINUE                                                          BH 01370
      TNEG=1                                                            BH 01380
      GO TO 37                                                          BH 01390
25    ISN=1                                                             BH 01400
      DO 251 I=1,6                                                      BH 01410
      SOMAP(I)=0.                                                       BH 01420
      ULTMP(I)=0                                                        BH 01430
251   CONTINUE                                                          BH 01440
      PPC=1                                                             BH 01450
      ICABE=ILIGA(ICABE)                                                BH 01460
26    IF(ICABE-IFIM)27,32,27                                            BH 01470
27    IF(DIF(ICABE)-0)28,28,30                                          BH 01480
28    IF(ISN-1)29,31,29                                                 BH 01490
29    PPC=PPC+1                                                         BH 01500
      ISN=1                                                             BH 01510
      GO TO 31                                                          BH 01520
30    SOMAP(PPC)=SOMAP(PPC)+PREC(ICABE)                                 BH 01530
      ULTMP(PPC)=ICABE                                                  BH 01540
      ISN=0                                                             BH 01550
31    ICABE=ILIGA(ICABE)                                                BH 01560
      GO TO 26                                                          BH 01570
32    K=ULTMP(1)                                                        BH 01580
      PMC=SOMAP(1)                                                      BH 01590
      I=2                                                               BH 01600
33    IF(I-PPC)34,34,37                                                 BH 01610
34    IF(SOMAP(I)-PMC)36,36,35                                          BH 01620
35    PMC=SOMAP(I)                                                      BH 01630
      K=ULTMP(I)                                                        BH 01640
36    I=I+1                                                             BH 01650
      GO TO 33                                                          BH 01660
37    DO 62 KK=1,NLAM                                                   BH 01670
       IF(TNEG.NE.0)SEXC=0                                              BH 01680
       IF(TNEG.NE.0)SALT=0                                              BH 01690
      IF(TNEG-0)57,370,57                                               BH 01700
370    DO 372 II=1,2                                                    BH 01710
      IF(CA(KK)-ITABCA(II))372,371,372                                  BH 01720
371    KKK=II                                                           BH 01730
      GO TO 373                                                         BH 01740
372   CONTINUE                                                          BH 01750
      WRITE(6,1021)CA(KK)                                               BH 01760
      GO TO 63                                                          BH 01770
373   CONTR=CA(KK)                                                      BH 01780
      CONNEG=0                                                          BH 01790
      ARMZ(K)=99999                                                     BH 01800
38    IF(CONTR-ARMZ(K))39,48,48                                         BH 01810
39    ARMZ(K)=CONTR                                                     BH 01820
      NACM(K)=CONNEG                                                    BH 01830
      IF(NACM(K).LE.-415.AND.KK.EQ.1)ARMZ(K)=1                                  
      IF(NACM(K).LE.-1266.AND.KK.EQ.2)ARMZ(K)=1                                 
      J=K                                                               BH 01840
      AP1=K                                                             BH 01850
      AP=J-(J/12*12)+1                                                  BH 01860
40    IF(AP-K)42,41,42                                                  BH 01870
41    CONTR=ARMZ(AP1)+DIF(AP)                                           BH 01880
      TT=FLOAT(CONTR)/FLOAT(CA(KK))                                     BH 01890
      TT=ALOG(TT)/B(KKK)                                                BH 01900
      CONNEG=INTRO(TT)                                                  BH 01910
      GO TO 38                                                          BH 01920
42    IF(DIF(AP)-0)46,43,43                                             BH 01930
43    ARMAZ=ARMZ(AP1)+DIF(AP)                                           BH 01940
      IF(ARMAZ-CONTR)44,44,45                                           BH 01950
44    TT=ARMAZ/FLOAT(CA(KK))                                            BH 01960
       IF(DIF(AP).EQ.0.AND.ARMZ(AP1).EQ.0)GO TO 555                     BH 01970
      TT=ALOG(TT)/B(KKK)                                                BH 01980
      NACM(AP)=INTRO(TT)                                                BH 01990
      IF(NACM(AP).LE.-415.AND.KK.EQ.1)ARMAZ=1                                   
      IF(NACM(AP).LE.-1266.AND.KK.EQ.2)ARMAZ=1                                  
      GO TO 47                                                          BH 02000
555    NACM(AP)=NACM(AP-1)                                              BH 02010
       GO TO 47                                                         BH 02020
45    ARMAZ=CONTR                                                       BH 02030
      NACM(AP)=0                                                        BH 02040
      GO TO 47                                                          BH 02050
46    NACM(AP)=NACM(AP1)+DIF(AP)                                        BH 02060
      ARMAZ=CA(KK)*EXP(B(KKK)*NACM(AP))                                 BH 02070
      IF(NACM(AP).LE.-415.AND.KK.EQ.1)ARMAZ=1                                   
      IF(NACM(AP).LE.-1266.AND.KK.EQ.2)ARMAZ=1                                  
47    ARMZ(AP)=INTRO(ARMAZ)                                             BH 02080
      J=J+1                                                             BH 02090
      AP1=AP                                                            BH 02100
      AP=J-(J/12*12)+1                                                  BH 02110
      GO TO 40                                                          BH 02120
48    ALT(1)=ARMZ(1)-ARMZ(12)                                           BH 02130
      SALT=ALT(1)                                                       BH 02140
      IF(DIF(1)-0)49,49,50                                              BH 02150
49     ER(1)=IABS(ALT(1))+PREC(1)                                       BH 02160
      SER=INTRO(ER(1))                                                  BH 02170
      DEF(1)=EP(1)-INTRO(ER(1))                                         BH 02180
      SDEF=DEF(1)                                                       BH 02190
      EXC(1)=0                                                          BH 02200
      SEXC=0                                                            BH 02210
      GO TO 51                                                          BH 02220
50    ER(1)=EP(1)                                                       BH 02230
      SER=INTRO(ER(1))                                                  BH 02240
      DEF(1)=0                                                          BH 02250
      SDEF=0                                                            BH 02260
      EXC(1)=DIF(1)-IABS(ALT(1))                                        BH 02270
      SEXC=EXC(1)                                                       BH 02280
51    SEP=EP(1)                                                         BH 02290
      SPREC=INTRO(PREC(1))                                              BH 02300
      TM=TEMP(1)/12.                                                    BH 02310
      J=2                                                               BH 02320
52    IF(J-12)53,53,59                                                  BH 02330
53    ALT(J)=ARMZ(J)-ARMZ(J-1)                                          BH 02340
      SALT=SALT+ALT(J)                                                  BH 02350
      IF(DIF(J)-0)54,54,55                                              BH 02360
54    ER(J)=IABS(ALT(J))+PREC(J)                                        BH 02370
       SER=SER+INTRO(ER(J))                                             BH 02380
      DEF(J)=EP(J)-INTRO(ER(J))                                         BH 02390
      SDEF=SDEF+DEF(J)                                                  BH 02400
      EXC(J)=0                                                          BH 02410
      GO TO 56                                                          BH 02420
55    ER(J)=EP(J)                                                       BH 02430
      SER=SER+INTRO(ER(J))                                              BH 02440
      DEF(J)=0                                                          BH 02450
      EXC(J)=DIF(J)-IABS(ALT(J))                                        BH 02460
      SEXC=SEXC+EXC(J)                                                  BH 02470
56    SEP=SEP+EP(J)                                                     BH 02480
      SPREC=SPREC+INTRO(PREC(J))                                        BH 02490
      TM=TM+TEMP(J)/12.                                                 BH 02500
      J=J+1                                                             BH 02510
      GO TO 52                                                          BH 02520
57    TM=TEMP(1)/12.                                                    BH 02530
      SPREC=INTRO(PREC(1))                                              BH 02540
      SER=INTRO(ER(1))                                                  BH 02550
      SEP=EP(1)                                                         BH 02560
      SDEF=DEF(1)                                                       BH 02570
      DO 58 J=2,12                                                      BH 02580
      TM=TM+TEMP(J)/12.                                                 BH 02590
      SPREC=SPREC+INTRO(PREC(J))                                        BH 02600
      SER=SER+INTRO(ER(J))                                              BH 02610
      SEP=SEP+EP(J)                                                     BH 02620
      SDEF=SDEF+DEF(J)                                                  BH 02630
58    CONTINUE                                                          BH 02640
59    SDIF=DIF(1)                                                       BH 02650
      DO 60 J=2,12                                                      BH 02660
      SDIF=SDIF+DIF(J)                                                  BH 02670
60    CONTINUE                                                          BH 02680
      AA=100*FLOAT(SDEF)/FLOAT(SEP)                                             
      IA=INTRO(AA)                                                      BH 02700
       UU=100*FLOAT(SEXC)/FLOAT(SEP)                                            
      IU=INTRO(UU)                                                      BH 02720
       XM=UU-AA                                                         BH 02730
      IM=INTRO(XM)                                                      BH 02740
       IF(KK.EQ.1)GO TO 5003                                            BH 02750
       GO TO 5005                                                       BH 02760
5003   WRITE(6,5004)                                                    BH 02770
5004   FORMAT(1H1)                                                      BH 02780
       WRITE(6,90)                                                      BH 02790
90     FORMAT(//,28X,'UNIVERSIDADE FEDERAL DA PARAIBA',                 BH 02800
     */,28X,'DEPARTAMENTO DE CIENCIAS ATMOSFERICAS')                    BH 02810
5005    WRITE(6,1014)                                                   BH 02830
       WRITE(6,1015)NOME,LATH,LATM,HEMI(DIR1),LONGG,LONGM,DIR2,ALTIT    BH 02840
      WRITE(6,1016)                                                     BH 02850
      WRITE(6,1017)                                                     BH 02860
      WRITE(6,1016)                                                     BH 02870
      DO 61 I=1,12                                                      BH 02880
      WRITE(6,1018)MES(I),TEMP(I),IMC(I),E(I),C(I),EP(I),PREC(I),       BH 02890
     *DIF(I),NACM(I),ARMZ(I),ALT(I),ER(I),DEF(I),EXC(I)                 BH 02900
61    CONTINUE                                                          BH 02910
      WRITE(6,1016)                                                     BH 02920
       WRITE(6,1019)IAC,SEP,SPREC,SALT,SER,SDEF,SEXC                    02930   
      WRITE(6,1016)                                                     BH 02940
      WRITE(6,1020)IA,IM,IU,CA(KK)                                      BH 02950
       GO TO 62                                                         BH 02990
62    CONTINUE                                                          BH 03030
2021   CONTINUE                                                         BH 03040
1014     FORMAT(//,28X,'BALANCO HIDRICO SEGUNDO THORNTHWAITE(1957)')    BH 03050
1015   FORMAT(/,28X,'LOCAL - ',20A1,2X,'LAT ',I2,'G',I2,'M',2X,A1,3X,'LOBH 03060
     *NG ',I3,'G',I2,'M',1X,A1,5X,'ALT ',F6.1,1X,'M')                   BH 03070
1016   FORMAT(28X,78('-'))                                              BH 03080
1017  FORMAT(28X,'MES   T(C)  IMC   E   CORR    EP    P     DIF  NACM  ABH 03090
     *RMZ  ALT    ER  DEF  EXC')                                        BH 03100
1018   FORMAT(28X,A3,F6.1,F6.1,F5.1,F6.1,I6,F7.1,3I6,I5,F6.0,2I5)       BH 03110
1019   FORMAT(28X,'ANO',6X,I6,11X,I6,I7,6X,12X,I5,I6,2I5)                       
1020   FORMAT(28X,'IA=',I4,5X,'IU=',I4,5X,'IH=',I4,32X,'CAP.ARM.=',I3,1XBH 03130
     *,'MM')                                                            BH 03140
1021  FORMAT(28X,'ERRO... ESTE PROGRAMA NAO RECONHECE A CA = ',I3)      BH 03150
63    STOP                                                              BH 03160
      END                                                               BH 03170
