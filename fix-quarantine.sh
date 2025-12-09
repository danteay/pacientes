#!/bin/bash

# Script to fix "damaged" app error on macOS
# This removes the quarantine attribute that causes the false "damaged" warning

echo "════════════════════════════════════════════════════════════"
echo "  Pacientes - Fix Installation Script"
echo "════════════════════════════════════════════════════════════"
echo ""

APP_PATH="/Applications/Pacientes.app"

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: Pacientes.app not found in Applications folder"
    echo ""
    echo "Please make sure you have:"
    echo "1. Opened the DMG file"
    echo "2. Dragged Pacientes.app to Applications folder"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Found Pacientes.app in Applications"
echo ""
echo "Removing quarantine attribute..."

# Remove quarantine attribute
xattr -cr "$APP_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Success! The quarantine attribute has been removed."
    echo ""
    echo "You can now open Pacientes normally:"
    echo "1. Go to Applications folder"
    echo "2. Double-click Pacientes.app"
    echo ""
    echo "Or open from Spotlight (⌘ + Space, type 'Pacientes')"
else
    echo ""
    echo "❌ Error: Failed to remove quarantine attribute"
    echo ""
    echo "Try running this command in Terminal:"
    echo "  sudo xattr -cr /Applications/Pacientes.app"
    echo ""
    echo "You'll be asked for your password."
fi

echo ""
echo "════════════════════════════════════════════════════════════"
read -p "Press Enter to exit..."
