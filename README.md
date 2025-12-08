# Pacientes

A patient management desktop application built with Electron and TypeScript for psychologists and mental health professionals.

## Overview

Pacientes is a cross-platform desktop application designed to help mental health professionals manage patient records and appointment notes securely. The application features a modern, intuitive interface with robust data persistence using SQLite.

## Features

### Patient Management
- Create, read, update, and delete patient records
- Comprehensive patient information including:
  - Personal details (name, age, email, phone)
  - Demographic data (marital status, gender, education level)
  - Professional information (profession, living situation)
  - Psychological history
  - First appointment date tracking
- Advanced search functionality across patient records
- Patient list with newest-first ordering

### Appointment Notes
- Create and manage session notes for each patient
- Rich text content support
- Automatic tracking of first appointment dates
- Chronological ordering of notes (newest first)
- Cascade deletion when patients are removed

### Data Persistence
- SQLite database with better-sqlite3 for reliable data storage
- Automatic database migrations for schema updates
- Foreign key constraints for data integrity
- Backup-friendly file-based storage

### Security & Architecture
- Secure architecture with context isolation
- IPC communication between main and renderer processes
- Type-safe TypeScript codebase
- Comprehensive test coverage

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

# Create distributable packages
npm run make

# Package for current platform
npm run package
```

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
- **21 migration tests**: Database schema and migration integrity
- **22 user service tests**: Patient CRUD operations and search
- **23 appointment service tests**: Note management and relationships
- **Total: 66 comprehensive integration tests**

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
│   ├── main/                    # Main process
│   │   ├── main.ts             # Application entry point
│   │   ├── database/           # Database layer
│   │   │   ├── database.ts     # Database service facade
│   │   │   └── migrations/     # Schema migrations
│   │   └── services/           # Business logic
│   │       ├── users.ts        # Patient management service
│   │       └── appointments.ts # Note management service
│   ├── preload/                # Preload scripts
│   │   └── preload.ts         # Secure IPC bridge
│   ├── renderer/               # Renderer process (UI)
│   │   ├── index.html         # Main application page
│   │   ├── styles.css         # Application styles
│   │   └── renderer.ts        # UI logic
│   └── types/                  # TypeScript type definitions
│       ├── patient.ts         # Patient types and enums
│       └── note.ts            # Note types
├── dist/                       # Compiled output
├── out/                        # Packaged applications
├── coverage/                   # Test coverage reports
└── database.sqlite            # SQLite database file
```

## Architecture

### Multi-Process Design

The application follows Electron's multi-process architecture:

- **Main Process** (`src/main/`): Manages application lifecycle, windows, and database operations
- **Preload Script** (`src/preload/`): Secure bridge exposing controlled APIs to renderer
- **Renderer Process** (`src/renderer/`): Handles UI and user interactions

### Service Layer

The application uses a service-oriented architecture:

- **DatabaseService**: Coordinates database operations and manages service instances
- **Users Service**: Handles all patient-related operations (CRUD, search)
- **Appointments Service**: Manages appointment notes and patient relationships

### Database Migrations

The application uses a migration system for database schema management:

- **Migration #1**: Creates initial tables (patients and notes)
- **Migration #2**: Adds first appointment date tracking
- Migrations are tracked and run automatically on startup
- Idempotent design allows safe re-runs

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
  previousPsychologicalExperience?: string;
  firstAppointmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Development Workflow

### Adding New Features

1. **Update Types**: Add or modify types in `src/types/`
2. **Create Migration**: Add migration in `src/main/database/migrations/`
3. **Update Service**: Implement business logic in appropriate service
4. **Write Tests**: Add integration tests for new functionality
5. **Update UI**: Modify renderer process for user interaction

### Running Migrations

Migrations run automatically on application startup. To add a new migration:

1. Create a new migration method in `Migrations` class
2. Add it to the `migrations` array
3. Increment the migration number
4. The system will detect and run new migrations automatically

### Testing Strategy

The application uses Jest for testing with three test suites:

- **Integration Tests**: Test services with real database
- **Migration Tests**: Verify database schema changes
- **End-to-End Coverage**: Tests cover full workflows

All tests use in-memory SQLite databases for fast, isolated testing.

## Database

### Schema

**patients** table:
- id, name, age, email, phoneNumber
- birthDate, maritalStatus, gender
- educationalLevel, profession, livesWith, children
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
window.api.patients.search(term)

window.api.notes.create(noteData)
window.api.notes.getByPatientId(patientId)
window.api.notes.update(noteData)
window.api.notes.delete(id)
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

- **Electron 39.2.4**: Desktop application framework
- **TypeScript 5.3.3**: Type-safe JavaScript
- **better-sqlite3 12.5.0**: Synchronous SQLite3 bindings
- **Jest 30.2.0**: Testing framework
- **electron-forge**: Build and packaging

## License

MIT

## Support

For detailed architecture and development guidelines, see [CLAUDE.md](./CLAUDE.md).

For issues and questions, please open an issue on the GitHub repository.
