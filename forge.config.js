module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    ignore: [
      /^\/src/,
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/node_modules\/\.cache/,
      /(.eslintrc|.gitignore|.prettierrc|tsconfig.json)/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'pacientes',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Your Name',
          homepage: 'https://github.com/yourusername/pacientes',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/yourusername/pacientes',
        },
      },
    },
  ],
  plugins: [],
};
