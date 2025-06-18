@echo off
echo Iniciando servidor local para probar...
echo.
echo Abre en tu navegador: http://localhost:8000
echo.
echo Para detener: Ctrl+C
echo.
cd deploy-final
python -m http.server 8000