# Code Signing for macOS

## Overview

The application is now configured to create DMG installers for macOS distribution. To prevent the "corrupted" warning when sharing via AirDrop or downloading from the internet, the application should be code signed and notarized.

## Current Configuration

The `forge.config.js` file is configured to automatically sign and notarize the application **if** the required environment variables are set. If these variables are not set, the build will complete without signing (for local development).

## Required for Distribution

To distribute the application without security warnings, you need:

1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate** installed in Keychain
3. **Environment Variables** set before building

## Environment Variables

### Option 1: Using .env file (Recommended)

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your credentials
```

Example `.env` file:
```bash
# Disable code signing (for development/testing)
SKIP_CODE_SIGNING=true

# Or enable code signing (for distribution)
# SKIP_CODE_SIGNING=false
# APPLE_ID=your-apple-id@example.com
# APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx
# APPLE_TEAM_ID=XXXXXXXXXX
# SIGNING_IDENTITY=Developer ID Application: Your Name (TEAM_ID)
```

Then source it before building:
```bash
source .env
npm run make
```

### Option 2: Export variables directly

Set these environment variables before running `npm run make`:

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="app-specific-password"  # Generate from appleid.apple.com
export APPLE_TEAM_ID="YOUR_TEAM_ID"               # 10-character team ID
export SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"  # Optional
```

### Force Disable Code Signing

If you have environment variables set but want to build unsigned:

```bash
export SKIP_CODE_SIGNING=true
npm run make
```

Or inline:
```bash
SKIP_CODE_SIGNING=true npm run make
```

## Getting Your Team ID

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Click on "Membership" in the sidebar
3. Your Team ID is listed there (10-character alphanumeric)

## Generating App-Specific Password

1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in with your Apple ID
3. Go to Security → App-Specific Passwords
4. Click "Generate Password"
5. Enter a label (e.g., "Electron Notarization")
6. Copy the generated password

## Building Signed DMG

Once environment variables are set:

```bash
npm run make
```

The build process will:
1. Compile the application
2. Package it for macOS (arm64)
3. Sign the application with your Developer ID certificate
4. Create a DMG installer
5. Notarize the DMG with Apple (if credentials provided)

## Local Development (Unsigned)

For local development without signing:

```bash
# Simply run without setting the environment variables
npm run make
```

You should see the message: `Building without code signing (unsigned build for development)`

The DMG will be created at `out/make/Pacientes.dmg` but not signed. This is fine for:
- Local testing
- Internal team distribution
- Development purposes

**Note**: Unsigned builds will show security warnings when shared via AirDrop or downloaded.

### Opening Unsigned Builds

Recipients of unsigned builds can open the app by:

**Method 1 - Control-Click (Recommended)**:
1. Open the DMG file
2. Drag the app to Applications folder
3. Control-click (right-click) the app in Applications
4. Select "Open"
5. Click "Open" in the security dialog

**Method 2 - System Preferences**:
1. Try to open the app (you'll see a security warning)
2. Go to System Preferences → Security & Privacy
3. Click "Open Anyway"

**Method 3 - Command Line**:
```bash
xattr -cr /Applications/Pacientes.app
```

This removes the quarantine attribute that causes the warning.

## Troubleshooting

### Build fails when .env is sourced

**Error**: `Failed to codesign your application` or `code has no resources but signature indicates they must be present`

**Solution**: Add `SKIP_CODE_SIGNING=true` to your `.env` file:

```bash
# In your .env file
SKIP_CODE_SIGNING=true
```

Or build with the flag:
```bash
source .env
SKIP_CODE_SIGNING=true npm run make
```

This happens when environment variables are set but:
- The Developer ID certificate is not installed in Keychain
- The certificate has expired
- The credentials are incorrect

### "corrupted" warning on unsigned builds

This is expected behavior for unsigned applications on macOS. Users can bypass this by:
1. Control-click the app
2. Select "Open"
3. Click "Open" in the dialog

### Certificate not found

Make sure you have a valid "Developer ID Application" certificate installed in Keychain Access. You can request one from the Apple Developer portal.

To list your certificates:
```bash
security find-identity -v -p codesigning
```

### Notarization failed

- Check that your Apple ID credentials are correct
- Ensure 2FA is enabled on your Apple ID
- Use an app-specific password, not your regular password
- Verify your Team ID is correct

### Missing environment variables warning

If you see: `⚠ Code signing disabled: Missing required environment variables`

This means some (but not all) signing variables are set. Either:
1. Set all required variables: `APPLE_ID`, `APPLE_ID_PASSWORD`, `APPLE_TEAM_ID`
2. Or disable signing: `export SKIP_CODE_SIGNING=true`

## Files

- `forge.config.js` - Electron Forge configuration with signing setup
- `entitlements.plist` - macOS entitlements for code signing

## Resources

- [Apple Developer Program](https://developer.apple.com/programs/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Electron Forge Documentation](https://www.electronforge.io/guides/code-signing)
