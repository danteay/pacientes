# Nix Development Environment Setup

This project uses Nix flakes to provide a reproducible development environment with all necessary build tools for native Node.js modules (specifically better-sqlite3).

## Prerequisites

1. **Install Nix** (with flakes enabled):
   ```bash
   curl -L https://nixos.org/nix/install | sh -s -- --daemon
   ```

2. **Enable Flakes** (add to `~/.config/nix/nix.conf` or `/etc/nix/nix.conf`):
   ```
   experimental-features = nix-command flakes
   ```

3. **Install direnv** (optional, but recommended):
   ```bash
   # macOS
   brew install direnv

   # Add to your shell config (~/.zshrc or ~/.bashrc)
   eval "$(direnv hook zsh)"  # or bash
   ```

## Usage

### Option 1: Using direnv (Recommended)

If you have direnv installed:

```bash
# Allow direnv to load the environment
direnv allow

# The environment will automatically load when you enter the directory
# You'll see the environment details printed
```

### Option 2: Manual nix develop

Without direnv:

```bash
# Enter the Nix development shell
nix develop

# You're now in the development environment with all tools available
```

## What's Included

The Nix environment provides:

- **Node.js 20** - JavaScript runtime
- **npm** - Package manager
- **Python 3.11** - Required for node-gyp
- **gcc** - C++ compiler for native modules
- **make** - Build tool
- **pkg-config** - Build configuration tool
- **SQLite** - Database library
- **node-gyp** - Native module build tool

## Building the Project

Once in the Nix environment:

```bash
# Install dependencies (this will compile better-sqlite3)
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Why Nix?

- **Reproducible builds** - Everyone gets the exact same development environment
- **No system pollution** - Dependencies are isolated and don't affect your system
- **Cross-platform** - Works on macOS, Linux, and WSL
- **Version locked** - Specific versions of all tools ensure consistent builds

## Troubleshooting

### better-sqlite3 compilation fails

Make sure you're inside the Nix environment:
```bash
nix develop
npm rebuild better-sqlite3
```

### direnv not loading

```bash
direnv allow
```

### Nix flakes not enabled

Check your Nix configuration includes:
```
experimental-features = nix-command flakes
```
