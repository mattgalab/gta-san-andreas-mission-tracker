@echo off
echo Installing nodejs
call winget install nodejs
echo Installing GTA San Andreas Mission Tracker...
call npm install
echo Installation abgeschlossen!
pause
