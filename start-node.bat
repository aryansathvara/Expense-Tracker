@echo off
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe 2>nul

echo Waiting 2 seconds for ports to release...
timeout /t 2 /nobreak >nul

echo Starting Node.js server...
cd "node js"
node app.js 