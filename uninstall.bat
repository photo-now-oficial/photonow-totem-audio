@echo off
setlocal
set "STARTUP_BAT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PhotoNow-Totem-Audio.bat"

if exist "%STARTUP_BAT%" del /f /q "%STARTUP_BAT%"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":9090 .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)

echo Atalho do Startup removido e servidor na porta 9090 encerrado.
pause
