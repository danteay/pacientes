═══════════════════════════════════════════════════════════════
    ⚠️  READ THIS FIRST - IMPORTANT INSTALLATION INFO  ⚠️
═══════════════════════════════════════════════════════════════

If you see "Pacientes is damaged and can't be opened":

THIS IS A FALSE WARNING! The app works perfectly.

QUICK FIX (30 seconds):
────────────────────────────────────────────────────────────────

1. Open Terminal:
   • Press ⌘ (Command) + Space
   • Type "Terminal"
   • Press Enter

2. Copy and paste this command:
   xattr -cr /Applications/Pacientes.app

3. Press Enter

4. Open Pacientes normally

DONE! ✓

WHY THIS HAPPENS:
────────────────────────────────────────────────────────────────

macOS adds a "quarantine" flag to downloaded apps for security.
This causes a false "damaged" error for unsigned applications.

The command above safely removes this flag.

NEED MORE HELP?
────────────────────────────────────────────────────────────────

See INSTALL.txt for detailed instructions and troubleshooting.

═══════════════════════════════════════════════════════════════
