@echo off
IF NOT EXIST ".env" (
    echo Create a .env and fill with correct information
    pause   
    exit /B 1
)

set "distFolder=%~dp0dist"

IF EXIST "%distFolder%" (
    rmdir /S /Q "%distFolder%"
    echo Folder has been deleted: %distFolder%
)

echo Starting to rebuild

call npm run build

echo Building is finished
pause