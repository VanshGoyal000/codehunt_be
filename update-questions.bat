@echo off
echo CodeHunt Quiz Questions Update
echo ============================
echo.
echo This script will update the quiz questions in your database
echo Warning: All existing questions will be replaced!
echo.
set /p confirm=Are you sure you want to proceed? (y/n): 

if /i "%confirm%" neq "y" (
  echo Operation cancelled.
  goto :EOF
)

cd scripts
node update-questions.js

echo.
echo Press any key to exit...
pause >nul
