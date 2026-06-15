@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "INSTALL_DIR=%~dp0"
if "%INSTALL_DIR:~-1%"=="\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo ============================================
echo   PhotoNow - Instalador de audio local
echo   Pasta: %INSTALL_DIR%
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale o Node.js LTS: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

for %%D in (saudacoes despedidas musica logs) do (
  if not exist "%INSTALL_DIR%\%%D" mkdir "%INSTALL_DIR%\%%D"
)

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_BAT=%STARTUP%\PhotoNow-Totem-Audio.bat"

(
echo @echo off
echo cd /d "%INSTALL_DIR%"
echo call start-audio-server.bat ^>^> "%INSTALL_DIR%\logs\audio-server.log" 2^>^&1
) > "%STARTUP_BAT%"

echo [OK] Pastas de audio verificadas.
echo [OK] Atalho criado no Startup:
echo      %STARTUP_BAT%
echo.

echo Iniciando servidor de audio agora...
start "" /MIN "%INSTALL_DIR%\start-audio-server.bat"

echo Aguardando servidor subir...
timeout /t 3 /nobreak >nul

echo.
echo Instalacao concluida.
echo.
echo Teste no navegador:
echo   http://127.0.0.1:9090/
echo   http://127.0.0.1:9090/manifest.json
echo.
echo Coloque os arquivos em:
echo   %INSTALL_DIR%\saudacoes\
echo   %INSTALL_DIR%\despedidas\
echo   %INSTALL_DIR%\musica\
echo.
echo Se a pasta musica estiver vazia, o totem usa a musica embutida no app.
echo.
pause
