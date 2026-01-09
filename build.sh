#!/bin/bash
# Build script for production

echo "📦 Building frontend..."
cd frontend
npm install
npm run build

echo "📋 Copying frontend to backend/static..."
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

echo "🔨 Building backend..."
cd ../backend
go build -o app .

echo "✅ Build complete!"
echo "Run with: cd backend && ./app"
