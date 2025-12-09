# Distributing Pacientes (Unsigned Build)

## Overview

This guide explains how to distribute the unsigned DMG build of Pacientes and what users need to know to install it.

## What Users Need to Know

Since this is an unsigned build, macOS Gatekeeper will show a security warning when users try to open the app for the first time. This is **normal behavior** for unsigned applications and **does not mean the app is malicious or damaged**.

### ⚠️ IMPORTANT: "App is Damaged" Error

If users see **"Pacientes is damaged and can't be opened. You should move it to the Trash"**, this is a **FALSE warning** caused by macOS quarantine flags on downloaded files.

**Quick Fix** (30 seconds):
1. Open Terminal (Applications → Utilities → Terminal)
2. Type: `xattr -cr /Applications/Pacientes.app`
3. Press Enter
4. Open Pacientes normally

This removes the quarantine flag. The app is NOT damaged.

## Installation Instructions for Users

### Quick Install Guide

Create a simple instruction document for your users:

```markdown
# Installing Pacientes

1. **Download** the Pacientes.dmg file
2. **Open** the DMG file (double-click it)
3. **Drag** Pacientes.app to your Applications folder
4. **Close** the DMG window
5. **Open** Finder and go to Applications
6. **Right-click** (or Control+click) on Pacientes.app
7. **Select** "Open" from the menu
8. **Click** "Open" in the dialog that appears
9. The app will now run normally!

Note: You only need to do the right-click method the first time. After that, you can open it normally.
```

### Detailed Installation Instructions

For users who need more help, provide these detailed steps:

```markdown
# Installing Pacientes - Detailed Guide

## Step-by-Step Installation

1. **Download the DMG file**
   - You should have received a file named `Pacientes.dmg`
   - Save it to your Downloads folder

2. **Open the DMG file**
   - Double-click `Pacientes.dmg` in your Downloads folder
   - A new window will open showing the Pacientes icon

3. **Install to Applications**
   - Drag the Pacientes icon to the Applications folder
   - Wait for the copy to complete
   - Close the DMG window

4. **First Time Opening**
   - Open Finder
   - Go to Applications (⌘+Shift+A)
   - Find "Pacientes" in the list
   - **Right-click** (or hold Control and click) on Pacientes
   - Select "Open" from the menu
   - A dialog will appear asking if you're sure
   - Click "Open"

5. **Future Opens**
   - After the first time, you can open Pacientes normally
   - Just double-click it or open from Spotlight

## Why This Is Necessary

Pacientes is not signed with an Apple Developer certificate. This is a security feature of macOS called "Gatekeeper" that protects users from malicious software.

**This does not mean Pacientes is dangerous.** It simply means it hasn't been through Apple's notarization process.

## Alternative: Command Line Method

If you're comfortable with Terminal, you can remove the quarantine flag:

```bash
xattr -cr /Applications/Pacientes.app
```

After running this command, you can open Pacientes normally.

## Troubleshooting

### ⚠️ "Pacientes is damaged and can't be opened" (MOST COMMON ISSUE)

**This message is FALSE** - the app is NOT damaged! This happens when macOS adds a quarantine flag to downloaded files.

**Solution - Remove Quarantine Flag**:

**Option 1 - Terminal Command (Quick & Easy)**:
```bash
xattr -cr /Applications/Pacientes.app
```
Copy and paste this into Terminal (Applications → Utilities → Terminal), press Enter, then open the app normally.

**Option 2 - Use the Fix Script**:
If included with your distribution, double-click `fix-quarantine.sh` and follow the prompts.

**Option 3 - Remove Quarantine from DMG BEFORE Installing**:
```bash
# Remove quarantine from the DMG first
xattr -cr ~/Downloads/Pacientes.dmg

# Then open DMG and install normally
```

**Why This Happens**: macOS automatically flags downloaded files as "quarantined" for security. This flag causes the false "damaged" error for unsigned apps.

### "Cannot be opened because the developer cannot be verified"

This is the **expected message** for unsigned apps and means the right-click method will work. Use the right-click → Open method described in the installation instructions above.

### Still Having Issues?

Try with sudo (requires your password):
```bash
sudo xattr -cr /Applications/Pacientes.app
```

Then try opening the app again.
```

## Distribution Methods

### 1. Direct File Sharing

**Best for**: Small teams, personal contacts

**How to**:
```bash
# After building
npm run make

# The DMG is at:
out/make/Pacientes.dmg

# Share via:
- Email (if < 25MB)
- Dropbox, Google Drive, OneDrive
- WeTransfer
- AirDrop (may show "corrupted" warning - users can still install)
```

**Include with DMG**:
- A text file with installation instructions
- Link to support documentation

### 2. Self-Hosted Download

**Best for**: Small to medium distribution

**Setup**:
```bash
# Upload to your web server
# Create a simple download page with:
- Download button for DMG
- Installation instructions
- System requirements
- Support contact
```

**Example download page**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Download Pacientes</title>
</head>
<body>
    <h1>Download Pacientes</h1>
    <p>Patient management software for mental health professionals</p>

    <a href="Pacientes.dmg" download>
        <button>Download for macOS (124 MB)</button>
    </a>

    <h2>Installation Instructions</h2>
    <ol>
        <li>Download and open the DMG file</li>
        <li>Drag Pacientes to Applications</li>
        <li>Right-click the app and select "Open"</li>
        <li>Click "Open" in the security dialog</li>
    </ol>

    <h2>System Requirements</h2>
    <ul>
        <li>macOS 11.0 (Big Sur) or later</li>
        <li>Apple Silicon (M1/M2/M3) or Intel processor</li>
    </ul>
</body>
</html>
```

### 3. GitHub Releases

**Best for**: Open source projects, version tracking

**Setup**:
```bash
# 1. Tag your release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 2. Create release on GitHub
# 3. Upload Pacientes.dmg as release asset
# 4. Add release notes with installation instructions
```

**Release Notes Template**:
```markdown
## Pacientes v1.0.0

### Installation Instructions

⚠️ **Important**: This is an unsigned build. After installation, right-click the app and select "Open" to bypass macOS Gatekeeper.

[Detailed Installation Guide](link-to-guide)

### Download

- [Pacientes-1.0.0.dmg](link) (124 MB)
- SHA256: [checksum]

### What's New

- Initial release
- Patient management system
- Appointment notes with rich text editor
- SQLite database for data persistence

### System Requirements

- macOS 11.0 or later
- 200 MB free disk space
```

## Improving User Experience

### Create a README.txt for the DMG

Include this file inside the DMG (visible when users open it):

```bash
# Create README.txt
cat > INSTALL.txt << 'EOF'
INSTALLATION INSTRUCTIONS
=========================

1. Drag Pacientes.app to Applications folder
2. Open Applications in Finder
3. RIGHT-CLICK on Pacientes.app
4. Select "Open"
5. Click "Open" in the dialog

You only need to do this once!

Why? This app is not signed with an Apple certificate.
This is normal for small independent software.

For help: [your-email@example.com]
EOF
```

### Create Automated Script for Users

Create a helper script users can run:

```bash
#!/bin/bash
# install-pacientes.sh

echo "Installing Pacientes..."

# Copy to Applications
cp -R "/Volumes/Pacientes/Pacientes.app" "/Applications/"

# Remove quarantine
xattr -cr "/Applications/Pacientes.app"

echo "✓ Installation complete!"
echo "You can now open Pacientes from Applications"
echo ""
echo "Press any key to close..."
read -n 1
```

## Security Considerations

When distributing unsigned builds:

### What You Should Do:
✅ Use HTTPS for downloads
✅ Provide SHA256 checksums
✅ Document the software source
✅ Provide clear contact information
✅ Keep distribution channels secure

### What to Tell Users:
✅ Explain why it's unsigned (saves $99/year cost)
✅ Provide verification method (checksum)
✅ Give clear installation instructions
✅ Offer support contact

### Generate Checksum:
```bash
# After building, create checksum
shasum -a 256 out/make/Pacientes.dmg > Pacientes.dmg.sha256

# Include in documentation
cat Pacientes.dmg.sha256
```

## When to Consider Code Signing

You should get an Apple Developer account ($99/year) and sign your builds if:

❌ Users are non-technical
❌ Wide public distribution
❌ Professional/commercial software
❌ Users uncomfortable with workarounds
❌ App Store distribution desired

✅ You can stay unsigned if:
- Small user base
- Technical users
- Internal/team use
- Budget constraints
- Testing/development distribution

## Summary

**Yes, you can absolutely distribute unsigned DMGs!**

✅ Works perfectly for:
- Internal company use
- Small teams
- Friends and family
- Beta testing
- Development versions

⚠️ Requires:
- Clear installation instructions
- User education about security warnings
- Support for users who encounter issues

💰 Consider signing for:
- Professional/commercial distribution
- Non-technical users
- Large user base
- Enhanced trust/credibility
