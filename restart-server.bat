@echo off
echo Stopping any existing Node.js servers on port 3000...

:: Find process using port 3000 and kill it (Windows only)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
  echo Found process: %%P on port 3000
  taskkill /F /PID %%P
  echo Killed process %%P
)

:: Wait for port to be released
timeout /t 2

:: Start the server
echo Starting Node.js server...
cd "node js"
start cmd /k "node app.js"

:: Open reset password tool
echo Opening password reset tool...
start reset-password.html

:: Wait a bit and then open application
timeout /t 3
echo Opening Expense Tracker application...
start http://localhost:5173/login

echo Server restart complete! 