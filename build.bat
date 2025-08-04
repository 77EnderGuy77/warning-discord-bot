@echo off
IF NOT EXIST ".env" (
    echo Create a .env and fill with correct information
    pause   
    exit /B 1
)

call npm run build
call npm run register
pause