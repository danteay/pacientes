# Pacientes

A modern, enterprise-grade patient management desktop application built with Electron, React, and TypeScript for psychologists and mental health professionals.

## Overview

Pacientes is a cross-platform desktop application designed to help mental health professionals manage patient records and appointment notes securely. The application features a modern React-based interface with robust data persistence using SQLite, following enterprise-level architectural patterns and best practices.

## Features

### Patient Management
- Create, read, update, and delete patient records
- **Patient Status Tracking**: Track treatment status (Active, Paused, Medical Discharge)
- Comprehensive patient information including:
  - Personal details (name, age, email, phone)
  - Demographic data (marital status, gender, education level)
  - Professional information (profession, living situation)
  - Psychological history
  - First appointment date tracking
- **Advanced Filtering**: Combined search and status filtering
- Advanced search functionality across patient records
- Patient list with newest-first ordering
- Color-coded status badges for quick visual identification

### Appointment Notes
- Create and manage session notes for each patient
- Rich text editor with draft-js integration
- Automatic tracking of first appointment dates
- Chronological ordering of notes (newest first)
- Cascade deletion when patients are removed
- View and edit note history per patient

### Data Management
- **Backup & Restore**: Export and import patient data with progress tracking
- SQLite database with better-sqlite3 for reliable data storage
- **Dynamic Migration System**: Automatically discovers and runs new migrations
- Foreign key constraints for data integrity
- Backup-friendly file-based storage in user's app data directory

### Modern React Architecture
- **Service-Repository-Driver Pattern** for clean separation of concerns
- **Atomic Design Pattern** for component organization (Atoms → Molecules → Organisms)
- **Custom React Hooks** for state management and data fetching
- **Context API** for global state (notifications)
- **Error Boundaries** for graceful error handling
- Type-safe IPC communication abstraction

### Security & Quality
- Secure architecture with context isolation
- IPC communication between main and renderer processes
- Type-safe TypeScript codebase with strict mode
- **110 comprehensive unit tests** with 100% pass rate
- DevTools hidden in production builds
- Input validation and sanitization

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the application in development mode with:
- Automatic TypeScript compilation
- Hot reload for renderer process
- Live asset copying
- Electron dev tools enabled

### Building

```bash
# Compile TypeScript
npm run build

# Run the production build
npm start

# Create distributable packages (DMG for macOS, DEB/RPM for Linux, Squirrel for Windows)
npm run make

# Package for current platform (without creating installer)
npm run package
```

**Note**: The build creates a DMG installer for macOS (`out/make/Pacientes.dmg`). The DMG is unsigned by default. For distribution without security warnings, see [CODE_SIGNING.md](./CODE_SIGNING.md) for code signing instructions.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

The test suite includes:
- **15 repository tests**: Data access layer with database operations
- **25 service tests**: Business logic validation and error handling
- **15 hook tests**: React custom hooks (usePatients, useNotes)
- **41 component tests**: UI components (atoms, molecules, organisms)
- **Total: 110 comprehensive unit tests** with 100% pass rate

### Code Quality

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Clean build artifacts
npm run clean
```

## Project Structure

```
pacientes/
├── src/
│   ├── main/                           # Main process (Node.js)
│   │   ├── main.ts                    # Application entry point
│   │   ├── database/                  # Database layer
│   │   │   ├── database-service.ts   # Database service facade
│   │   │   ├── driver.ts             # SQLite driver abstraction
│   │   │   ├── repositories/         # Data access layer
│   │   │   │   ├── patient-repository.ts
│   │   │   │   └── note-repository.ts
│   │   │   └── migrations/           # Schema migrations
│   │   │       ├── umzug.ts          # Dynamic migration loader
│   │   │       ├── 001-*.ts          # Initial schema
│   │   │       ├── 002-*.ts          # First appointment dates
│   │   │       └── 003-*.ts          # Patient status tracking
│   │   └── services/                 # Business logic layer
│   │       ├── patient-service.ts    # Patient management
│   │       ├── note-service.ts       # Note management
│   │       └── backup.ts             # Backup/restore service
│   ├── preload/                      # Preload scripts
│   │   └── preload.ts               # Secure IPC bridge
│   ├── renderer/                     # Renderer process (React)
│   │   ├── App.tsx                  # Root React component
│   │   ├── components/              # React components
│   │   │   ├── atoms/               # Basic components
│   │   │   │   ├── Button/
│   │   │   │   └── Input/
│   │   │   ├── molecules/           # Composite components
│   │   │   │   ├── SearchBar/
│   │   │   │   └── PatientCard/
│   │   │   └── organisms/           # Complex components
│   │   │       ├── PatientList/
│   │   │       ├── PatientForm/
│   │   │       └── PatientNotes/
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── usePatients.ts
│   │   │   ├── useNotes.ts
│   │   │   └── useAsync.ts
│   │   ├── context/                 # React Context providers
│   │   │   └── NotificationContext.tsx
│   │   ├── pages/                   # Page components
│   │   │   ├── PatientsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/                # Frontend services
│   │   │   └── ipc-client.ts        # IPC abstraction layer
│   │   └── styles.scss              # Application styles
│   └── types/                        # TypeScript type definitions
│       ├── patient.ts               # Patient types and enums
│       └── note.ts                  # Note types
├── dist/                             # Compiled output
├── out/                              # Packaged applications
├── coverage/                         # Test coverage reports
└── database.sqlite                  # SQLite database file
```

## Architecture

### Multi-Process Design

The application follows Electron's multi-process architecture:

- **Main Process** (`src/main/`): Manages application lifecycle, windows, and database operations
- **Preload Script** (`src/preload/`): Secure bridge exposing controlled APIs to renderer
- **Renderer Process** (`src/renderer/`): Handles UI and user interactions

### Service-Repository-Driver Pattern

The backend follows a three-layer architecture for clean separation of concerns:

**Driver Layer** (`src/main/database/driver.ts`):
- Abstracts SQLite database operations
- Provides transaction support
- Handles query execution and parameter binding
- Single source of truth for database access

**Repository Layer** (`src/main/database/repositories/`):
- Data access objects (DAOs) for entities
- Maps database rows to TypeScript objects
- Handles SQL queries and result transformation
- One repository per entity (PatientRepository, NoteRepository)

**Service Layer** (`src/main/services/`):
- Business logic and validation
- Orchestrates repository operations
- Input sanitization and normalization
- Error handling and logging
- Exposed to renderer via IPC

### React Component Architecture

The frontend follows Atomic Design principles:

**Atoms** (`src/renderer/components/atoms/`):
- Basic building blocks (Button, Input, Badge)
- No business logic, purely presentational
- Highly reusable across the application

**Molecules** (`src/renderer/components/molecules/`):
- Combinations of atoms (SearchBar, PatientCard)
- Simple component logic
- Reusable across different contexts

**Organisms** (`src/renderer/components/organisms/`):
- Complex components with business logic (PatientList, PatientForm, PatientNotes)
- Use custom hooks for state management
- Handle user interactions and data flow

**Custom Hooks** (`src/renderer/hooks/`):
- Encapsulate state management and data fetching logic
- `usePatients`: Patient CRUD operations and search
- `useNotes`: Note management for patients
- `useAsync`: Generic async operation handling

**Context API** (`src/renderer/context/`):
- Global state management (NotificationContext)
- Provides success/error notifications across components

### Database Migrations

The application uses a dynamic migration system:

- **Migration #1**: Creates initial tables (patients and notes)
- **Migration #2**: Adds first appointment date tracking
- **Migration #3**: Adds patient status field
- Migrations are automatically discovered using `fs.readdirSync()`
- Tracked and run automatically on startup via Umzug
- Idempotent design allows safe re-runs
- New migrations are detected by filename pattern (`/^\d{3}-.*\.(ts|js)$/`)

### Type System

Strong TypeScript typing throughout:

```typescript
// Patient types with enums
enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated'
}

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

enum PatientStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  MEDICAL_DISCHARGE = 'medical_discharge'
}

interface Patient {
  id?: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  birthDate: string;
  maritalStatus: MaritalStatus;
  gender: Gender;
  educationalLevel: string;
  profession: string;
  livesWith: string;
  children: number;
  status: PatientStatus;
  previousPsychologicalExperience?: string;
  firstAppointmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Development Workflow

### Adding New Features

1. **Update Types**: Add or modify types in `src/types/`
2. **Create Migration**: Add migration file in `src/main/database/migrations/` (format: `NNN-description.ts`)
3. **Update Repository**: Add data access methods in repository layer
4. **Update Service**: Implement business logic and validation in service layer
5. **Write Tests**: Add unit tests for repositories, services, and components
6. **Update IPC**: Add IPC handlers in main.ts and expose in preload.ts
7. **Update UI**: Create/modify React components using hooks

### Running Migrations

Migrations run automatically on application startup. To add a new migration:

1. Create a new migration file following the naming convention: `NNN-description.ts`
   - Use sequential numbering (001, 002, 003, etc.)
   - Example: `003-add-patient-status.ts`
2. Export `up` and `down` functions with proper TypeScript signatures:
   ```typescript
   export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
     const db = context;
     db.exec('ALTER TABLE patients ADD COLUMN new_field TEXT');
   }

   export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
     const db = context;
     db.exec('ALTER TABLE patients DROP COLUMN new_field');
   }
   ```
3. The system automatically discovers and runs new migrations on startup
4. No need to manually register migrations - they're loaded dynamically

### Testing Strategy

The application uses Jest with a multi-project configuration for comprehensive testing:

**Backend Tests** (Node environment):
- **Repository Tests**: Test data access layer with in-memory SQLite
- **Service Tests**: Test business logic, validation, and error handling
- All backend tests use isolated in-memory databases

**Frontend Tests** (JSDOM environment):
- **Hook Tests**: Test custom React hooks with react-hooks-testing-library
- **Component Tests**: Test UI components with React Testing Library
- Uses `@testing-library/react` for user-centric testing
- Mocks IPC communication via `window.api`

**Test Organization**:
- Co-located with source files (e.g., `patient-service.ts` → `patient-service.test.ts`)
- Jest runs Node and JSDOM projects in parallel
- 100% pass rate across all test suites

## Database

### Schema

**patients** table:
- id, name, age, email, phoneNumber
- birthDate, maritalStatus, gender
- educationalLevel, profession, livesWith, children
- status (active, paused, medical_discharge)
- previousPsychologicalExperience (optional)
- firstAppointmentDate (optional)
- createdAt, updatedAt

**notes** table:
- id, patientId (foreign key)
- title, content
- createdAt, updatedAt

**migrations** table:
- id, number, runAt

### Data Integrity

- Foreign key constraints with CASCADE DELETE
- Automatic timestamp management
- Transaction support for complex operations
- Millisecond-precision timestamps for update tracking

## IPC Communication

The application uses a secure IPC bridge via the preload script:

```typescript
// Available APIs exposed to renderer
window.api.patients.create(patientData)
window.api.patients.getAll()
window.api.patients.getById(id)
window.api.patients.update(patientData)
window.api.patients.delete(id)
window.api.patients.search(term, status?)  // Status filter optional

window.api.notes.create(noteData)
window.api.notes.getByPatientId(patientId)
window.api.notes.update(noteData)
window.api.notes.delete(id)

window.api.backup.export(filePath)
window.api.backup.import(filePath)
```

## Security Considerations

- Context isolation enabled
- Node integration disabled in renderer
- Sandboxed renderer process
- Controlled IPC communication
- No remote module usage
- Input validation on all operations

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Remove the database and restart (will lose data)
rm database.sqlite

# Run migrations manually
npm start
```

### Native Module Issues

If better-sqlite3 fails to load:
```bash
# Rebuild for your platform
npm rebuild better-sqlite3

# Rebuild for Electron
npm run postinstall
```

### Test Failures

If tests fail after updating Node.js:
```bash
# Rebuild native modules for Node.js
npm rebuild better-sqlite3

# Run tests
npm test

# Rebuild for Electron before running app
npm run postinstall
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing patterns and conventions
- Write tests for new features
- Update documentation as needed

## Technology Stack

### Core
- **Electron 39.2.4**: Desktop application framework
- **TypeScript 5.3.3**: Type-safe JavaScript with strict mode
- **React 18.3.1**: UI library for building component-based interfaces
- **better-sqlite3 12.5.0**: Synchronous SQLite3 bindings

### Database & Migrations
- **Umzug 3.8.2**: Database migration framework
- **SQLite**: Embedded relational database

### Testing
- **Jest 30.2.0**: Testing framework with multi-project support
- **@testing-library/react 16.1.0**: React component testing utilities
- **@testing-library/jest-dom 6.6.3**: Custom Jest matchers for DOM
- **ts-jest 30.0.0**: TypeScript preprocessor for Jest

### UI & Styling
- **Bulma 1.0.2**: CSS framework for responsive design
- **Sass 1.83.1**: CSS preprocessor
- **Draft.js 0.11.7**: Rich text editor framework

### Build & Development
- **electron-forge**: Build and packaging
- **Vite 6.0.7**: Frontend build tool and dev server
- **electron-vite**: Electron + Vite integration
- **ESLint 9.18.0**: Code linting and quality

## License

MIT

## Support

For detailed architecture and development guidelines, see [CLAUDE.md](./CLAUDE.md).

For issues and questions, please open an issue on the GitHub repository.
