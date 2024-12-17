@echo off
echo Installing nodejs
call winget install nodejs
echo Installing GTA San Andreas Mission Tracker...
call "C:\Program Files\nodejs\npm.cmd" install
echo Installation abgeschlossen!
pause