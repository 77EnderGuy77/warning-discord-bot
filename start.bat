@echo off
setlocal

set "BUILD_DIR=dist"

IF NOT EXIST "%BUILD_DIR%\" (
  echo Directory "%BUILD_DIR%" does not exist!

  echo Running build.bat…

  start "" "%~dp0build.bat"

  pause
  exit /B 1
)

npm run start

pause
