@echo off
echo Starting Chronosi Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL is running (you may need to adjust this check)
echo Checking database connection...
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Setup database tables
echo Setting up database tables...
npm run setup
if %errorlevel% neq 0 (
    echo Warning: Database setup failed. Make sure PostgreSQL is running.
    echo Continuing anyway...
)

REM Start the backend server
echo Starting backend server...
npm run dev

pause

