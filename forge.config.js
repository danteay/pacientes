// Build packager config conditionally
const packagerConfig = {
  asar: true,
  icon: './assets/icon',
  ignore: [
    /^\/src/,
    /^\/\.git/,
    /^\/\.vscode/,
    /^\/node_modules\/\.cache/,
    /(.eslintrc|.gitignore|.prettierrc|tsconfig.json)/,
  ],
};

// Determine if code signing should be enabled
// Check for explicit disable flag first
const shouldSign = process.env.SKIP_CODE_SIGNING !== 'true'
  && process.env.APPLE_ID
  && process.env.APPLE_ID_PASSWORD
  && process.env.APPLE_TEAM_ID;

if (shouldSign) {
  console.log('✓ Code signing enabled with Apple Developer credentials');
  console.log(`  Apple ID: ${process.env.APPLE_ID}`);
  console.log(`  Team ID: ${process.env.APPLE_TEAM_ID}`);
  console.log(`  Identity: ${process.env.SIGNING_IDENTITY || 'Developer ID Application (auto-detect)'}`);

  packagerConfig.osxSign = {
    identity: process.env.SIGNING_IDENTITY || 'Developer ID Application',
    hardenedRuntime: true,
    entitlements: 'entitlements.plist',
    'entitlements-inherit': 'entitlements.plist',
    'signature-flags': 'library'
  };

  packagerConfig.osxNotarize = {
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  };
} else {
  if (process.env.SKIP_CODE_SIGNING === 'true') {
    console.log('✓ Code signing explicitly disabled (SKIP_CODE_SIGNING=true)');
  } else if (process.env.APPLE_ID || process.env.APPLE_ID_PASSWORD || process.env.APPLE_TEAM_ID) {
    console.log('⚠ Code signing disabled: Missing required environment variables');
    console.log('  Required: APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID');
    console.log('  To skip this warning, set SKIP_CODE_SIGNING=true');
  } else {
    console.log('✓ Building without code signing (unsigned build for development)');
  }
}

module.exports = {
  packagerConfig,
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Pacientes',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Pacientes',
        // Simple DMG without custom background to avoid appdmg dependency issues
        format: 'ULFO'
      },
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Eduardo Aguilar <dante.aguilar41@gmail.com>',
          homepage: 'https://github.com/danteay/pacientes',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/danteay/pacientes',
        },
      },
    },
  ],
  plugins: [],
};
