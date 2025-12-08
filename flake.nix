{
  description = "Pacientes - Patient Management Electron App";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js and npm
            nodejs_20

            # Python for node-gyp (required for building native modules)
            python311
            python311Packages.setuptools  # Provides distutils

            # Build tools for native node modules (use clang on macOS)
            (if pkgs.stdenv.isDarwin then pkgs.clang else pkgs.gcc)
            gnumake
            pkg-config

            # Required for better-sqlite3
            sqlite

            # Additional tools
            nodePackages.npm
            nodePackages.node-gyp
          ];

          shellHook = ''
            echo "🔧 Pacientes Development Environment"
            echo "=================================="
            echo "Node.js: $(node --version)"
            echo "npm: $(npm --version)"
            echo "Python: $(python --version)"
            echo "SQLite: $(sqlite3 --version)"
            echo ""
            echo "Environment ready for better-sqlite3 native module compilation!"
            echo ""

            # Set environment variables for node-gyp
            export PYTHON="${pkgs.python311}/bin/python"
            export npm_config_python="${pkgs.python311}/bin/python"

            # Use system clang/clang++ on macOS to avoid issues with libc++
            ${if pkgs.stdenv.isDarwin then ''
              export CC="clang"
              export CXX="clang++"
            '' else ""}
          '';
        };
      }
    );
}
