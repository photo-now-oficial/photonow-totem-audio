@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [PhotoNow Audio] Node.js nao encontrado. Execute install.bat primeiro.
  exit /b 1
)

netstat -ano | findstr /R /C:":9090 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  exit /b 0
)

:reiniciar
node server\server.js
echo [PhotoNow Audio] Servidor encerrado. Reiniciando em 3s...
timeout /t 3 /nobreak >nul
goto reiniciar
