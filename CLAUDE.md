# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pacientes is a psychological patient management desktop application built with Electron and TypeScript. The application manages patient personal information and history with full CRUD functionality, storing data in an embedded SQLite database.

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **TypeScript**: Type-safe JavaScript for all source code
- **SQLite (sql.js)**: WebAssembly-based SQLite database for patient data storage
- **Electron Forge**: Building and packaging tool
- **ESLint**: Code linting and style enforcement

## Project Structure

```
pacientes/
├── src/
│   ├── main/                    # Main process (Node.js environment)
│   │   ├── main.ts              # Application entry point, IPC handlers
│   │   └── database/
│   │       └── database.ts      # SQLite database service
│   ├── preload/                 # Preload scripts (IPC bridge)
│   │   └── preload.ts           # Context bridge API for secure IPC
│   ├── renderer/                # Renderer process (browser environment)
│   │   ├── index.html           # Main UI markup with patient form
│   │   ├── styles.css           # Application styles
│   │   └── renderer.ts          # Frontend logic and patient management
│   └── types/
│       └── patient.ts           # Patient type definitions and enums
├── dist/                        # Compiled TypeScript output (gitignored)
├── out/                         # Electron Forge build output (gitignored)
├── forge.config.js              # Electron Forge configuration
└── tsconfig.json                # TypeScript configuration
```

## Development Commands

### Installation
```bash
npm install
```

### Development
```bash
npm run dev          # Start development mode with hot reload for TS and assets
npm run watch        # Watch TypeScript files for changes only
npm run build        # Compile TypeScript and copy HTML/CSS assets
npm run copy:assets  # Copy HTML and CSS files to dist
```

### Code Quality
```bash
npm run lint         # Run ESLint on source files
npm run type-check   # Run TypeScript type checking without emitting files
```

### Production Build
```bash
npm run package      # Package the app for current platform
npm run make         # Create distributable packages
npm start            # Build and run the production app
```

### Cleaning
```bash
npm run clean        # Remove dist and out directories
```

## Architecture

### Electron Process Model

The application follows Electron's multi-process architecture:

1. **Main Process** (`src/main/main.ts`):
   - Runs in Node.js environment
   - Manages application lifecycle and BrowserWindows
   - Handles IPC communication via `ipcMain.handle()`
   - Manages database service instance
   - Has full access to Node.js APIs and file system

2. **Preload Script** (`src/preload/preload.ts`):
   - Runs before renderer process loads
   - Uses `contextBridge` to safely expose patient APIs to renderer
   - Maintains security through controlled IPC communication
   - Defines all available IPC channels for patient operations

3. **Renderer Process** (`src/renderer/`):
   - Runs in browser environment
   - Handles UI rendering and user interactions
   - Communicates with main process through `window.api.patient` methods
   - Isolated from Node.js for security

### Database Architecture

**Database Location**: SQLite database file is stored in the user's application data directory (`app.getPath('userData')`), typically:
- macOS: `~/Library/Application Support/pacientes/pacientes.db`
- Windows: `%APPDATA%/pacientes/pacientes.db`
- Linux: `~/.config/pacientes/pacientes.db`

**Schema** (src/main/database/database.ts:16):
```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT NOT NULL,
  phoneNumber TEXT NOT NULL,
  birthDate TEXT NOT NULL,           -- ISO date string
  maritalStatus TEXT NOT NULL,       -- Enum: single, married, divorced, widowed, separated
  gender TEXT NOT NULL,              -- Enum: male, female, other, prefer_not_to_say
  educationalLevel TEXT NOT NULL,
  profession TEXT NOT NULL,
  livesWith TEXT NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  previousPsychologicalExperience TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

**Database Service** (src/main/database/database.ts:1):
- `initialize()`: **Async** - Must be called before any other database operations. Loads existing database or creates new one
- `createPatient(patientData)`: Insert new patient record
- `getPatientById(id)`: Retrieve patient by ID
- `getAllPatients()`: Retrieve all patients ordered by creation date
- `updatePatient(patientData)`: Update existing patient (auto-updates `updatedAt`)
- `deletePatient(id)`: Delete patient by ID
- `searchPatients(searchTerm)`: Search by name, email, or phone number
- `close()`: Close database connection (called on app quit)

**Note**: sql.js keeps the database in memory and saves to disk after each modification. This provides good performance while ensuring data persistence.

### IPC Communication

**Available Channels** (src/main/main.ts:32):
- `patient:create` - Create new patient
- `patient:getAll` - Get all patients
- `patient:getById` - Get patient by ID
- `patient:update` - Update patient
- `patient:delete` - Delete patient
- `patient:search` - Search patients

**Response Format**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Patient Data Model

**Patient Fields** (src/types/patient.ts:1):
- `id`: Auto-incremented primary key
- `name`: Full name
- `age`: Age in years
- `email`: Email address
- `phoneNumber`: Phone number
- `birthDate`: Birth date (ISO string format)
- `maritalStatus`: Enum - single, married, divorced, widowed, separated
- `gender`: Enum - male, female, other, prefer_not_to_say
- `educationalLevel`: Educational background
- `profession`: Current or previous profession
- `livesWith`: Living situation
- `children`: Number of children
- `previousPsychologicalExperience`: Text description of prior therapy/treatment
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

### Security Model

- **Context Isolation**: Enabled to prevent renderer from directly accessing Node.js
- **Node Integration**: Disabled in renderer for security
- **Preload Script**: Used as secure bridge with explicit API exposure
- **Content Security Policy**: Enforced in HTML to prevent XSS attacks
- **Input Sanitization**: HTML escaping in renderer before displaying user data

### TypeScript Configuration

- Target: ES2020
- Module: CommonJS (required for Electron main process)
- Lib: ES2020 + DOM (DOM types for renderer process)
- Strict mode enabled for type safety
- Output compiled to `dist/` directory maintaining source structure

## User Interface

The application has two main views:

1. **Patient List View** (default):
   - Search bar for filtering patients
   - Grid of patient cards with basic info
   - Edit and Delete buttons on each card
   - "Add Patient" button to show form

2. **Patient Form View**:
   - Comprehensive form with all patient fields
   - Used for both creating and editing patients
   - Form validation for required fields
   - Cancel button returns to list view

**Notifications**: Success and error messages appear as animated notifications in the top-right corner.

## Development Workflow

1. Run `npm install` to install dependencies (including sql.js)
2. Use `npm run dev` to start development mode
3. The app automatically recompiles TypeScript on save
4. HTML/CSS changes are watched and copied to dist automatically
5. DevTools open automatically in development mode
6. Database file is created automatically on first run (async initialization in main process)

## Adding Features

### Adding New Patient Fields

1. Update `Patient` interface in `src/types/patient.ts`
2. Update database schema in `src/main/database/database.ts` (initializeDatabase)
3. Update insert/update queries in DatabaseService methods
4. Add form fields to `src/renderer/index.html`
5. Update `getFormData()` and `fillForm()` in `src/renderer/renderer.ts`

### Adding New IPC Channels

1. Define handler in `src/main/main.ts` using `ipcMain.handle()`
2. Expose method in `src/preload/preload.ts` via `contextBridge.exposeInMainWorld()`
3. Update type declarations in `src/renderer/renderer.ts` (Window interface)
4. Call the method from renderer code via `window.api.patient.*`

### Database Migrations

If schema changes are needed after deployment:
- Add migration logic to `initializeDatabase()` in DatabaseService
- Check schema version and apply changes conditionally
- Always test migrations with existing data

## Building for Production

The project uses Electron Forge for building distributables:

- **Windows**: Squirrel installer
- **macOS**: ZIP archive
- **Linux**: DEB and RPM packages

Configure makers in `forge.config.js` for platform-specific build options.

**Note**: sql.js is a WebAssembly-based SQLite implementation that works across all platforms without native compilation, making builds simpler and more reliable.

## File References

- Main entry: src/main/main.ts:1
- Database service: src/main/database/database.ts:1
- Patient types: src/types/patient.ts:1
- Preload bridge: src/preload/preload.ts:1
- Renderer logic: src/renderer/renderer.ts:1
- UI markup: src/renderer/index.html:1
- Styles: src/renderer/styles.css:1
- TypeScript config: tsconfig.json:1
- Forge config: forge.config.js:1
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize
- to memorize