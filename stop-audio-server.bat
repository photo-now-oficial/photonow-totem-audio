@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================
echo   PhotoNow - Parar servidor de audio
echo ============================================
echo.

set "FOUND=0"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":9090 .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
  if not errorlevel 1 (
    set "FOUND=1"
    echo [OK] Processo na porta 9090 encerrado ^(PID %%P^).
  )
)

powershell -NoProfile -Command ^
  "$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'start-audio-server\.bat|server\\server\.js' }; foreach ($p in $procs) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }; if ($procs) { exit 0 } else { exit 1 }" >nul 2>&1

if not errorlevel 1 set "FOUND=1"

netstat -ano | findstr /R /C:":9090 .*LISTENING" >nul 2>&1
if errorlevel 1 (
  if "%FOUND%"=="1" (
    echo [OK] Servidor de audio parado.
  ) else (
    echo [INFO] Nenhum servidor rodando na porta 9090.
  )
) else (
  echo [AVISO] Ainda ha processo na porta 9090. Tente executar como Administrador.
)

echo.
pause
