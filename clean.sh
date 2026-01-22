#!/bin/bash

echo "Stopping all Node and Electron processes..."
# 'taskkill' is a Windows EXE, but we must pass arguments Windows-style 
# or use 'pkill' if on Linux/WSL. 
# For Git Bash on Windows, use this:
taskkill //F //IM node.exe //T 2>/dev/null
taskkill //F //IM electron.exe //T 2>/dev/null

#!/bin/bash

echo "🛑 Stopping all Node/Electron processes..."
taskkill //F //IM node.exe //T 2>/dev/null
taskkill //F //IM electron.exe //T 2>/dev/null

# echo "🧹 Removing all 'dist' folders..."
# rm -rf dist
# rm -rf apps/*/dist
# rm -rf packages/*/dist

# echo "🗑️  Removing all 'node_modules' (this will require npm install)..."
# rm -rf node_modules
# rm -rf apps/*/node_modules
# rm -rf packages/*/node_modules

# echo "💎 Clearing package-lock..."
# rm -f package-lock.json

# echo "✨ Cleanup complete. Run 'npm install' to restore dependencies."