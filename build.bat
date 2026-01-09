@echo off
REM Build script for production (Windows)

echo 📦 Building frontend...
cd frontend
call npm install
call npm run build

echo 📋 Copying frontend to backend/static...
if not exist "..\backend\static" mkdir "..\backend\static"
xcopy /E /Y dist\* ..\backend\static\

echo 🔨 Building backend...
cd ..\backend
go build -o app.exe .

echo ✅ Build complete!
echo Run with: cd backend ^&^& app.exe
