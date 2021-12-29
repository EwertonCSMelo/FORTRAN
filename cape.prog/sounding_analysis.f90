PROGRAM sounding

!******************************************************************************
!
!  Name:        Jason Patton
!  Email:       jpatton@iastate.edu
!  Assignment:  Homework #6 - GEMPAK Sounding (part 2)
!  Due:         11-14-2005
!
!  Description: This program will read in a file containing a sounding
!  output from GEMPAK, then find some specific pressure levels and
!  calculate some important instability functions.  The instability functions
!  will be interpreted and output along with the freezing level and level of
!  highest wind speed.  Station metadata will also be output.
!
!  Variable definitions:
!    station_name:  The name of the station being read in
!    station_num:  The station number
!    year, month, day, time:  What time and date the sounding was taken
!    latitude, longitude:  Position of the station
!    elevation:  Elevation of the station
!    lclp: LCL pressure level
!    lfct: LFC pressure level
!    eqlv: EL pressure level
!    pressure:  Array containing all the pressure readings
!    temperature:  2-D Array containing air and parcel temperatures
!    dewpoint:  Array containing all the dewpoint readings
!    wind_dir:  Array containing all the wind direction readings
!    wind_speed:  Array containing all the wind speed readings
!    height:  Array containing all the height readings
!    inputfile, outputfile:  Unit numbers for files being processed
!    open_r_status, open_w_status:  OPEN status variables
!    readstatus:  READ status variable
!    writestatus:  WRITE status variable
!    filename:  The file to be processed
!    data_length:  Length of the pressure, temp, etc. data in file
!    allocate_status:  ALLOCATE status variable
!    n:  DO loop counting variable
!    index_freezing:  Array point at which temperature is first < 0
!    index_850:  Array point which corresponds to pressure = 850
!    index_700:  Array point which corresponds to pressure = 700
!    index_500:  Array point which corresponds to pressure = 500
!    index_maxwind:  Array point which corresponds to the highest wind speed
!    freezing_level:  Pressure level of the freezing point
!    total_totals:  Total Totals calculation
!    k_index:  K-index calculation
!    sweat:  SWEAT index calculation
!    max_wind_level:  Pressure level of the highest wind speed
!    tt_out:  Interpretation of the Total Totals value
!    ki_out:  Interpretation of the K-index value
!    sw_out:  Interpretation of the SWEAT index value
!    pi:  Estimation of the constant pi
!    capeorcin:  Convective potential of a given layer
!    cin:  Convective inhibition calculation
!    cape:  Convective available potential energy calculation
!    li:  Lifted index calculation
!    cin_out:  Interpretation of the CIN value
!    cape_out:  Interpretation of the CAPE value
!    li_out:  Interpretation of the LI value
!
!******************************************************************************

IMPLICIT NONE

!Inputs
CHARACTER(3) :: station_name
INTEGER :: station_num, year, month, day, time
REAL :: latitude, longitude, elevation, lclp, lfct, eqlv
REAL, DIMENSION(:), ALLOCATABLE :: pressure, dewpoint, &
                                   wind_dir, wind_speed, height
REAL, DIMENSION(:,:), ALLOCATABLE :: temperature

!File processing and calculation variables
INTEGER, PARAMETER :: inputfile = 10, outputfile = 20
INTEGER :: open_r_status, open_w_status, readstatus, writestatus
CHARACTER(20) :: filename  !input by user
INTEGER :: n = 0, data_length = 0, allocate_status
REAL, PARAMETER :: pi = 3.1415926
REAL :: capeorcin

!Indexes
INTEGER :: index_freezing = 0, index_850, index_700, index_500, index_maxwind

!Outputs
REAL :: freezing_level, total_totals, k_index, sweat, max_wind_level
CHARACTER(30) :: tt_out, ki_out, sw_out, cape_out, cin_out, li_out
REAL :: cin = 0, cape = 0, li


! INPUT

!Ask for the input file
WRITE (*, '(A)', ADVANCE = 'NO') '>> Sounding Filename: '
READ*, filename


!Open the input file
OPEN (UNIT = inputfile, FILE = filename, STATUS = 'OLD', &
     ACTION = 'READ', POSITION = 'REWIND', IOSTAT = open_r_status)
IF (open_r_status .ne. 0) THEN
   PRINT*, '*** ERROR: Cannot open file for reading!'
   STOP
ENDIF

!Open the output file
OPEN (UNIT = outputfile, FILE = './hw6_jpatton.out', &
     ACTION = 'WRITE', POSITION = 'REWIND', IOSTAT = open_w_status)
IF (open_w_status .ne. 0) THEN
   PRINT*, '*** ERROR: Cannot open file for writing!'
   STOP
ENDIF


!Set up formats for input
100 FORMAT (T9, A3, T30, I5, T45, I2, T47, I2, T49, I2, T52, I4)
110 FORMAT (T9, F7.2, T28, F7.2, T45, F7.1 //)
120 FORMAT (T9, F7.2, T29, F7.2, T48, F7.2 //)
200 FORMAT (T4, F7.2, T13, F8.2, T22, F8.2, T32, F6.2, T41, F6.2, T48, F8.2)
250 FORMAT (//////)


!Read in headers
READ (UNIT = inputfile, FMT = 100, IOSTAT = readstatus) &
     station_name, station_num, year, month, day, time
IF (readstatus .ne. 0) THEN
   PRINT*, '*** ERROR: Problem reading headers... continuing...'
ENDIF

READ (UNIT = inputfile, FMT = 110, IOSTAT = readstatus) &
     latitude, longitude, elevation
IF (readstatus .ne. 0) THEN
   PRINT*, '*** ERROR: Problem reading headers... continuing...'
ENDIF


READ (UNIT = inputfile, FMT = 120, IOSTAT = readstatus) &
     lclp, lfct, eqlv
IF (readstatus .ne. 0) THEN
   PRINT*, '*** ERROR: Problem reading headers... continuing...'
ENDIF


!Find the length of the data
DO
   READ (UNIT = inputfile, FMT = *, IOSTAT = readstatus)
   IF (readstatus .lt. 0) EXIT
   data_length = data_length + 1
END DO


!Go back to beginning of the file
REWIND inputfile


!Allocate the sizes of the arrays
ALLOCATE(pressure(1:data_length), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "pressure"'
   STOP
ENDIF
ALLOCATE(temperature(1:data_length, 1:2), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "temperature"'
   STOP
ENDIF
ALLOCATE(dewpoint(1:data_length), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "dewpoint"'
   STOP
ENDIF
ALLOCATE(wind_dir(1:data_length), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "wind_dir"'
   STOP
ENDIF
ALLOCATE(wind_speed(1:data_length), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "wind_speed"'
   STOP
ENDIF
ALLOCATE(height(1:data_length), STAT = allocate_status)
IF (allocate_status .ne. 0) THEN
   PRINT*, 'Cannot allocate space for "height"'
   STOP
ENDIF


!Move back to the data section
READ (UNIT = inputfile, FMT = 250)


!Read in the data
DO n = 1, data_length

   READ (UNIT = inputfile, FMT = 200, IOSTAT = readstatus) &
        pressure(n), temperature(n,1), dewpoint(n), wind_dir(n), &
        wind_speed(n), height(n)

   IF (readstatus .gt. 0) THEN
      PRINT*, "*** ERROR: Problem reading data... continuing..."
   ENDIF

ENDDO


! CALCULATIONS

!Determine parcel temperatures
temperature(1,2) = temperature(1,1)

DO n = 2, data_length

   IF (pressure(n) .GT. lclp) THEN
      temperature(n,2) = temperature(n-1,2) - &
           (0.0097*(height(n) - height(n-1)))
   ELSE
      temperature(n,2) = temperature(n-1,2) - &
           (0.0049*(height(n) - height(n-1)))
   ENDIF

ENDDO


!Find key points in the arrays
DO n = 1, data_length
   IF ((temperature(n,1) .LE. 0.0).AND.(index_freezing .EQ. 0)) &
        index_freezing = n
   IF (pressure(n) .EQ. 850.0) index_850 = n
   IF (pressure(n) .EQ. 700.0) index_700 = n
   IF (pressure(n) .EQ. 500.0) index_500 = n
   IF (wind_speed(n) .EQ. MAXVAL(wind_speed)) index_maxwind = n
ENDDO


!Calculate CAPE and CIN
DO n = 1, data_length

   capeorcin = CAPE_CIN(temperature(n,1) + 273.15, &
           temperature(n+1,1) + 273.15, temperature(n,2) + 273.15, &
           temperature(n+1,2) + 273.15, height(n+1) - height(n))

   IF ((pressure(n+1) .GE. lfct).AND.(capeorcin .LT. 0.0)) THEN
      cin = cin + capeorcin

   ELSEIF ((pressure(n+1) .LE. lfct).AND.(pressure(n+1) .GE. eqlv).AND.&
        (capeorcin .GT. 0.0)) THEN
         cape = cape + capeorcin
   ENDIF

ENDDO

!Level and instability calculations
freezing_level = pressure(index_freezing)
total_totals = (temperature(index_850,1) - temperature(index_500,1)) + &
     (dewpoint(index_850) - temperature(index_500,1))
k_index = (temperature(index_850,1) - temperature(index_500,1)) + &
     (dewpoint(index_850) - (temperature(index_700,1) - dewpoint(index_700)))
sweat = (12.0 * dewpoint(index_850)) + (20.0 * (total_totals - 49.0)) + &
     (2.0 * wind_speed(index_850)) + (wind_speed(index_500)) + &
     (125.0 * ( SIN( (wind_dir(index_500) - wind_dir(index_850)) * (pi/180.0) &
     + 0.2)))
max_wind_level = pressure(index_maxwind)
li = temperature(index_500,1) - temperature(index_500,2)

!Interpret calculations
IF (total_totals .lt. 44.0) THEN
   tt_out = 'Convection not likely'
ELSEIF (total_totals .le. 50.0) THEN
   tt_out = 'Thunderstorms likely'
ELSEIF (total_totals .le. 52.0) THEN
   tt_out = 'Isolated severe storms'
ELSEIF (total_totals .le. 56.0) THEN
   tt_out = 'Widely scattered severe storms'
ELSEIF (total_totals .gt. 56.0) THEN
   tt_out = 'Scattered severe storms'
ENDIF

IF (k_index .lt. 15.0) THEN
   ki_out = 'No potential'
ELSEIF (k_index .le. 25.0) THEN
   ki_out = 'Small convective potential'
ELSEIF (k_index .le. 39.0) THEN
   ki_out = 'Moderate convective potential'
ELSEIF (k_index .ge. 40.0) THEN
   ki_out = 'High convective potential'
ENDIF

IF (sweat .lt. 150.0) THEN
   sw_out = 'No severe threat'
ELSEIF (sweat .le. 300.0) THEN
   sw_out = 'Slight severe threat'
ELSEIF (sweat .le. 400.0) THEN
   sw_out = 'Severe weather possible'
ELSEIF (sweat .gt. 400.0) THEN
   sw_out = 'Tornadoes possible'
ENDIF

IF (cin .le. -200.0) THEN
   cin_out = 'Strong cap'
ELSEIF (cin .lt. -50.0) THEN
   cin_out = 'Moderate cap'
ELSEIF (cin .le. 0.0) THEN
   cin_out = 'Weak cap'
ELSEIF (cin .gt. 0.0) THEN
   cin_out = 'No cap'
ENDIF

IF (cape .le. 0.0) THEN
   cape_out = 'No CAPE'
ELSEIF (cape .lt. 1500.0) THEN
   cape_out = 'Positive CAPE'
ELSEIF (cape .lt. 2500.0) THEN
   cape_out = 'Large CAPE'
ELSEIF (cape .ge. 2500.0) THEN
   cape_out = 'Extreme CAPE'
ENDIF

IF (li .gt. 0.0) THEN
   li_out = 'Stable'
ELSEIF (li .ge. -4.0) THEN
   li_out = 'Marginal instability'
ELSEIF (li .ge. -7.0) THEN
   li_out = 'Large instability'
ELSEIF (li .lt. -7.0) THEN
   li_out = 'Extreme instability'
ENDIF


! OUTPUT

!Set up formats for output
300 FORMAT (1X, I2.2, '/', I2.2, '/', I2.2, 1X, I4.4, 'Z sounding for ', &
         A3, ' (#', I5, ')')
310 FORMAT (1X, 'Located at latitude: ', F7.2, ' longitude: ', F7.2, /&
         1X, 'Elevation of', F7.1, 'm')
320 FORMAT (5X, 'The freezing level was at ', F6.2, 'mb')
330 FORMAT (5X, 'Total Totals = ', F6.1, T30, '-> ', A30)
340 FORMAT (5X, 'K-Index = ', F6.1, T30, '-> ', A30)
350 FORMAT (5X, 'SWEAT Index = ', F6.1, T30, '-> ', A30 /)
360 FORMAT (5X, 'Highest wind speed recorded at ', F6.2, 'mb')
370 FORMAT (5X, 'CIN = ', F7.1, ' J/kg', T30, '-> ', A30)
380 FORMAT (5X, 'CAPE = ', F7.1, ' J/kg', T30, '-> ', A30)
390 FORMAT (5X, 'LI = ', F6.1, ' C', T30, '-> ', A30)
400 FORMAT (70('-'))


!Write output to file
WRITE(UNIT = outputfile, FMT = *)
WRITE(UNIT = outputfile, FMT = 300) month, day, year, time, station_name, &
     station_num
WRITE(UNIT = outputfile, FMT = 310) latitude, longitude, elevation
WRITE(UNIT = outputfile, FMT = 400)
WRITE(UNIT = outputfile, FMT = 320) freezing_level
WRITE(UNIT = outputfile, FMT = 360) max_wind_level
WRITE(UNIT = outputfile, FMT = 330) total_totals, tt_out
WRITE(UNIT = outputfile, FMT = 340) k_index, ki_out
WRITE(UNIT = outputfile, FMT = 350) sweat, sw_out
WRITE(UNIT = outputfile, FMT = 370) cin, cin_out
WRITE(UNIT = outputfile, FMT = 380) cape, cape_out
WRITE(UNIT = outputfile, FMT = 390) li, li_out
WRITE(UNIT = outputfile, FMT = 400)
WRITE(UNIT = outputfile, FMT = *)

!Deallocate the arrays
DEALLOCATE(pressure)
DEALLOCATE(temperature)
DEALLOCATE(dewpoint)
DEALLOCATE(wind_dir)
DEALLOCATE(wind_speed)
DEALLOCATE(height)

!Close the files
CLOSE (inputfile)
CLOSE (outputfile)


!Build functions used in the program
CONTAINS

  !-CAPE_CIN---------------------------------------------------------------
  !
  !  Function to calculate the convective potential of a layer of air.
  !
  !  VARIABLES:
  !  Accepts:  Reals... two environmental temperatures (tempe1, tempe2),
  !    two parcel temperatures (tempp1, tempp2), and a layer thickness
  !    (dh)
  !
  !  Locals:  Gravity constant (g) and environmental and parcel 
  !    temperature means (tempemean, temppmean).
  !
  !  Returns:  Real, computed convective potential of layer (CAPE_CIN)
  !
  !------------------------------------------------------------------------

  FUNCTION CAPE_CIN(tempe1, tempe2, tempp1, tempp2, dh)
  
    ! Function
    REAL :: CAPE_CIN
    ! Input
    REAL, INTENT(IN) :: tempe1, tempe2, tempp1, tempp2, dh
    ! Simplified variables
    REAL, PARAMETER :: g = 9.8
    REAL :: tempemean, temppmean

    ! Calculations
    tempemean = (tempe1 + tempe2) / 2.0
    temppmean = (tempp1 + tempp2) / 2.0

    CAPE_CIN = g * ((temppmean - tempemean)/tempemean) * dh
  
  END FUNCTION CAPE_CIN
    
END PROGRAM sounding
