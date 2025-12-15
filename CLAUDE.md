# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pacientes is a psychological patient management desktop application built with Electron and TypeScript. The application manages patient personal information, clinical notes, emergency contacts, and legal tutors with full CRUD functionality, storing data in an embedded SQLite database. The application follows Domain-Driven Design (DDD) principles with clean architecture and Inversion of Control (IoC) using TSyringe.

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **TypeScript**: Type-safe JavaScript for all source code
- **Better-SQLite3**: High-performance synchronous SQLite database
- **TSyringe**: Microsoft's Dependency Injection container for IoC
- **Umzug**: Database migration management
- **Electron Forge**: Building and packaging tool
- **ESLint**: Code linting and style enforcement
- **Vite**: Fast frontend bundler for renderer process

## Project Structure

```
pacientes/
├── src/
│   ├── main/                                    # Main process (Node.js environment)
│   │   ├── main.ts                              # Application entry point
│   │   ├── database/
│   │   │   ├── database-service.ts              # Database lifecycle & service factory
│   │   │   ├── driver/
│   │   │   │   └── database-driver.ts           # Low-level DB operations wrapper
│   │   │   ├── migrations/                      # Database schema migrations
│   │   │   │   ├── umzug.ts                     # Migration configuration
│   │   │   │   └── *.sql                        # SQL migration files
│   │   │   └── repositories/
│   │   │       └── base-repository.ts           # Abstract base repository
│   │   ├── domains/                             # Domain-driven design structure
│   │   │   ├── patient/
│   │   │   │   ├── repository/
│   │   │   │   │   └── patient-repository.ts    # Patient data access
│   │   │   │   └── service/
│   │   │   │       └── patient-service.ts       # Patient business logic
│   │   │   ├── note/
│   │   │   │   ├── repository/
│   │   │   │   │   └── note-repository.ts       # Note data access
│   │   │   │   ├── service/
│   │   │   │   │   └── note-service.ts          # Note business logic
│   │   │   │   └── usecases/                    # Cross-domain operations
│   │   │   │       ├── create-note-usecase.ts   # Creates note + updates patient
│   │   │   │       └── get-notes-statistics-usecase.ts
│   │   │   ├── emergency-contact/
│   │   │   │   ├── repository/
│   │   │   │   │   └── emergency-contact-repository.ts
│   │   │   │   └── service/
│   │   │   │       └── emergency-contact-service.ts
│   │   │   └── legal-tutor/
│   │   │       ├── repository/
│   │   │       │   └── legal-tutor-repository.ts
│   │   │       └── service/
│   │   │           └── legal-tutor-service.ts
│   │   ├── handlers/                            # IPC handlers by domain
│   │   │   ├── patient/
│   │   │   │   └── index.ts                     # Patient IPC handlers
│   │   │   ├── note/
│   │   │   │   └── index.ts                     # Note IPC handlers
│   │   │   ├── emergency-contact/
│   │   │   │   └── index.ts                     # Emergency contact handlers
│   │   │   ├── legal-tutor/
│   │   │   │   └── index.ts                     # Legal tutor handlers
│   │   │   └── backup/
│   │   │       └── index.ts                     # Backup handlers
│   │   └── infrastructure/                      # Infrastructure layer
│   │       ├── ioc/
│   │       │   └── container.ts                 # TSyringe IoC container config
│   │       └── backup/
│   │           └── backup-service.ts            # Database backup functionality
│   ├── preload/                                 # Preload scripts (IPC bridge)
│   │   └── preload.ts                           # Context bridge API for secure IPC
│   ├── renderer/                                # Renderer process (browser environment)
│   │   ├── index.html                           # Main UI markup
│   │   ├── styles.scss                          # Application styles (Bulma CSS)
│   │   └── renderer.ts                          # Frontend logic
│   └── types/                                   # TypeScript type definitions
│       ├── patient.ts                           # Patient types & enums
│       ├── note.ts                              # Note types
│       ├── emergency-contact.ts                 # Emergency contact types
│       └── legal-tutor.ts                       # Legal tutor types
├── dist/                                        # Compiled TypeScript output (gitignored)
├── out/                                         # Electron Forge build output (gitignored)
├── forge.config.js                              # Electron Forge configuration
└── tsconfig.json                                # TypeScript configuration
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

### Clean Architecture with Domain-Driven Design

The application follows **Clean Architecture** principles with clear separation of concerns:

**Layers (from infrastructure to domain):**
1. **Database Layer**: DatabaseDriver provides low-level DB operations
2. **Repository Layer**: Data access and transformation for each domain
3. **Service Layer**: Business logic for single domain operations
4. **Use Case Layer**: Complex operations involving multiple domains
5. **Handler Layer**: IPC communication bridge
6. **Presentation Layer**: Electron renderer process (UI)

**Key Principles:**
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each class has one clear purpose
- **IoC Container**: TSyringe manages all dependency injection
- **Domain Isolation**: Services only import their own domain repository
- **Use Cases for Cross-Domain**: Multi-domain operations handled in use cases

### Domain Structure

Each domain follows this structure:

```
domain-name/
├── repository/           # Data access layer
│   └── <domain>-repository.ts
├── service/              # Business logic layer
│   └── <domain>-service.ts
└── usecases/             # Complex cross-domain operations (optional)
    └── <usecase>-usecase.ts
```

**Current Domains:**
- `patient`: Patient management
- `note`: Clinical notes/appointments
- `emergency-contact`: Emergency contact information
- `legal-tutor`: Legal guardian/tutor information

### Inversion of Control (IoC) Container

The application uses **TSyringe** for dependency injection:

**Configuration** (src/main/infrastructure/ioc/container.ts:1):
```typescript
export const DB_INSTANCE = 'DatabaseInstance';
export const DATABASE_DRIVER = 'DatabaseDriver';

export function configureContainer(db: Database.Database): void {
  container.registerInstance(DB_INSTANCE, db);
  container.register(DATABASE_DRIVER, {
    useFactory: (c) => {
      const dbInstance = c.resolve<Database.Database>(DB_INSTANCE);
      return new DatabaseDriver(dbInstance);
    },
  });
}
```

**Usage in Classes:**
```typescript
import { injectable } from 'tsyringe';

@injectable()
export class PatientService {
  constructor(private patientRepository: PatientRepository) {}
}
```

**Dependency Resolution** (src/main/database/database-service.ts:55):
```typescript
const container = getContainer();
const patientService = container.resolve(PatientService);
```

**Benefits:**
- Automatic dependency injection
- No manual wiring of dependencies
- Easy to test with mock implementations
- Type-safe dependency resolution

### Repository Pattern

**Base Repository** (src/main/database/repositories/base-repository.ts:1):
- Abstract class providing common CRUD operations
- All domain repositories extend this base class

**Domain Repositories**:
- Located in `src/main/domains/<domain>/repository/`
- Decorated with `@injectable()` for IoC
- Receive `DatabaseDriver` via constructor injection using `@inject(DATABASE_DRIVER)`
- Responsible for:
  - SQL query execution
  - Data mapping between database rows and domain entities
  - No business logic (belongs in services)

**Example** (src/main/domains/patient/repository/patient-repository.ts:1):
```typescript
@injectable()
export class PatientRepository extends BaseRepository<Patient, PatientCreateInput, PatientUpdateInput> {
  constructor(@inject(DATABASE_DRIVER) driver: DatabaseDriver) {
    super(driver, 'patients');
  }

  findById(id: number): Patient | undefined { /* ... */ }
  findAll(): Patient[] { /* ... */ }
  create(data: PatientCreateInput): Patient { /* ... */ }
  // ... other data access methods
}
```

### Service Layer

**Domain Services**:
- Located in `src/main/domains/<domain>/service/`
- Decorated with `@injectable()` for IoC
- Receive their domain repository via constructor injection
- Responsible for:
  - Business logic for single domain
  - Validation rules
  - Data normalization
  - Can ONLY import their own domain repository

**Example** (src/main/domains/patient/service/patient-service.ts:1):
```typescript
@injectable()
export class PatientService {
  constructor(private patientRepository: PatientRepository) {}

  createPatient(data: PatientCreateInput): Patient {
    this.validatePatientData(data);
    const normalizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
    };
    return this.patientRepository.create(normalizedData);
  }

  private validatePatientData(data: PatientCreateInput): void {
    // Business validation logic
  }
}
```

**Important**: Services should NOT access repositories from other domains. Use Use Cases for cross-domain operations.

### Use Case Layer

**Use Cases**:
- Located in `src/main/domains/<domain>/usecases/`
- Decorated with `@injectable()` for IoC
- Receive multiple domain services via constructor injection
- Responsible for:
  - Complex operations involving multiple domains
  - Orchestrating multiple services
  - Cross-domain business rules

**Example** (src/main/domains/note/usecases/create-note-usecase.ts:1):
```typescript
@injectable()
export class CreateNoteUseCase {
  constructor(
    private noteService: NoteService,
    private patientService: PatientService
  ) {}

  execute(noteData: NoteCreateInput): Note {
    // Validate patient exists (cross-domain check)
    const patient = this.patientService.getPatientById(noteData.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Create note
    const note = this.noteService.createNote(noteData);

    // Update patient's first appointment date (cross-domain operation)
    this.patientService.setFirstAppointmentDateIfNotSet(noteData.patientId);

    return note;
  }
}
```

### Database Service (Service Factory)

**DatabaseService** (src/main/database/database-service.ts:1):
- **NOT a facade** - doesn't expose domain operations directly
- Acts as a **Service Factory** providing access to domain services
- Responsibilities:
  - Initialize database connection (Better-SQLite3)
  - Run database migrations (Umzug)
  - Configure IoC container with database instance
  - Provide getter methods for services and use cases
  - Manage database lifecycle (initialization, closing)

**Usage**:
```typescript
const dbService = new DatabaseService();
await dbService.initialize();

// Get services via factory methods
const patientService = dbService.getPatientService();
const createNoteUseCase = dbService.getCreateNoteUseCase();

// Use services directly
const patient = patientService.createPatient(data);
```

**Key Methods**:
- `initialize()`: Async initialization, configures IoC container
- `getPatientService()`: Returns PatientService instance
- `getNoteService()`: Returns NoteService instance
- `getEmergencyContactService()`: Returns EmergencyContactService instance
- `getLegalTutorService()`: Returns LegalTutorService instance
- `getCreateNoteUseCase()`: Returns CreateNoteUseCase instance
- `getGetNotesStatisticsUseCase()`: Returns GetNotesStatisticsUseCase instance
- `getDatabase()`: Returns raw database instance (for backup service)
- `close()`: Closes database and clears IoC container

### IPC Handlers

**Handler Organization** (src/main/handlers/):
- Handlers are organized by domain in separate folders
- Each domain has an `index.ts` file that exports `setup<Domain>Handlers()` function
- Handlers receive DatabaseService and call domain services directly

**Example** (src/main/handlers/patient/index.ts:1):
```typescript
export function setupPatientHandlers(dbService: DatabaseService): void {
  const patientService = dbService.getPatientService();

  ipcMain.handle('patient:create', async (_event, patientData) => {
    try {
      const patient = patientService.createPatient(patientData);
      return { success: true, data: patient };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  // ... other handlers
}
```

**Main Entry Point** (src/main/main.ts:1):
```typescript
function setupIpcHandlers(): void {
  setupPatientHandlers(dbService);
  setupNoteHandlers(dbService);
  setupEmergencyContactHandlers(dbService);
  setupLegalTutorHandlers(dbService);
  setupBackupHandlers(backupService, () => mainWindow);
}
```

### Electron Process Model

The application follows Electron's multi-process architecture:

1. **Main Process** (`src/main/main.ts`):
   - Runs in Node.js environment
   - Manages application lifecycle and BrowserWindows
   - Handles IPC communication via domain-specific handlers
   - Manages DatabaseService instance
   - Has full access to Node.js APIs and file system

2. **Preload Script** (`src/preload/preload.ts`):
   - Runs before renderer process loads
   - Uses `contextBridge` to safely expose APIs to renderer
   - Maintains security through controlled IPC communication
   - Defines all available IPC channels

3. **Renderer Process** (`src/renderer/`):
   - Runs in browser environment
   - Handles UI rendering and user interactions
   - Communicates with main process through `window.api.*` methods
   - Isolated from Node.js for security

### Database Architecture

**Database Technology**: Better-SQLite3 (synchronous, high-performance)

**Database Location**: SQLite database file is stored in the user's home directory:
- All platforms: `~/pacientes_app.db`

**Migration System** (src/main/database/migrations/):
- Uses Umzug for migration management
- Migrations are SQL files in `src/main/database/migrations/`
- Automatically applied during `DatabaseService.initialize()`
- Migration history tracked in `migrations` table

**Database Tables**:
1. `patients`: Patient personal information
2. `notes`: Clinical notes/appointments
3. `emergency_contacts`: Emergency contact information
4. `legal_tutors`: Legal guardian/tutor information

**Schema References**:
- Patient schema: src/main/database/migrations/2024.01.01T00.00.01.patients.sql:1
- Note schema: src/main/database/migrations/2024.01.01T00.00.02.notes.sql:1
- Emergency contacts: src/main/database/migrations/2024.01.01T00.00.03.emergency_contacts.sql:1
- Legal tutors: src/main/database/migrations/2024.01.01T00.00.04.legal_tutors.sql:1

### IPC Communication

**Available Channels by Domain**:

**Patient** (src/main/handlers/patient/index.ts:1):
- `patient:create` - Create new patient
- `patient:getAll` - Get all patients
- `patient:getById` - Get patient by ID
- `patient:update` - Update patient
- `patient:delete` - Delete patient
- `patient:search` - Search patients
- `patient:getByStatus` - Filter patients by status
- `patient:getStats` - Get patient statistics

**Note** (src/main/handlers/note/index.ts:1):
- `note:create` - Create new note (uses CreateNoteUseCase)
- `note:getAll` - Get all notes
- `note:getById` - Get note by ID
- `note:getByPatientId` - Get notes for a patient
- `note:update` - Update note
- `note:delete` - Delete note
- `note:deleteByPatientId` - Delete all notes for a patient
- `note:search` - Search notes
- `note:getStats` - Get notes statistics (uses GetNotesStatisticsUseCase)

**Emergency Contact** (src/main/handlers/emergency-contact/index.ts:1):
- `emergency-contact:create` - Create emergency contact
- `emergency-contact:getById` - Get by ID
- `emergency-contact:getByPatientId` - Get by patient ID
- `emergency-contact:update` - Update emergency contact
- `emergency-contact:delete` - Delete emergency contact
- `emergency-contact:deleteByPatientId` - Delete all for patient

**Legal Tutor** (src/main/handlers/legal-tutor/index.ts:1):
- `legal-tutor:create` - Create legal tutor
- `legal-tutor:getById` - Get by ID
- `legal-tutor:getByPatientId` - Get by patient ID
- `legal-tutor:update` - Update legal tutor
- `legal-tutor:delete` - Delete legal tutor
- `legal-tutor:deleteByPatientId` - Delete all for patient

**Backup** (src/main/handlers/backup/index.ts:1):
- `backup:create` - Create database backup
- `backup:restore` - Restore database from backup
- `backup:export-json` - Export patients to JSON
- `backup:import-json` - Import patients from JSON

**Response Format**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Data Models

**Patient** (src/types/patient.ts:1):
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
- `previousPsychologicalExperience`: Text description
- `firstAppointmentDate`: Date of first appointment (auto-set on first note)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Note** (src/types/note.ts:1):
- `id`: Auto-incremented primary key
- `patientId`: Foreign key to patient
- `title`: Note title
- `content`: Note content
- `creationDate`: Date the note was created (editable)
- `createdAt`: System timestamp
- `updatedAt`: Last update timestamp

**Emergency Contact** (src/types/emergency-contact.ts:1):
- `id`: Auto-incremented primary key
- `patientId`: Foreign key to patient
- `fullName`: Contact full name
- `phoneNumber`: Contact phone
- `relation`: Relationship to patient
- `email`: Contact email
- `address`: Contact address (optional)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Legal Tutor** (src/types/legal-tutor.ts:1):
- `id`: Auto-incremented primary key
- `patientId`: Foreign key to patient
- `fullName`: Tutor full name
- `phoneNumber`: Tutor phone
- `relation`: Relationship to patient
- `email`: Tutor email
- `birthDate`: Tutor birth date
- `address`: Tutor address (optional)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

### Infrastructure Services

**Backup Service** (src/main/infrastructure/backup/backup-service.ts:1):
- Not managed by IoC (requires raw database instance)
- Created directly in main.ts
- Responsibilities:
  - Create database backups
  - Restore from backups
  - Export patients to JSON
  - Import patients from JSON

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
- **Decorators enabled**: `experimentalDecorators: true`, `emitDecoratorMetadata: true`
- Output compiled to `dist/` directory maintaining source structure

## User Interface

The application has multiple views:

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

3. **Notes View**:
   - List of clinical notes for a patient
   - Create, edit, and delete notes
   - Note creation date is editable

4. **Emergency Contacts View**:
   - List of emergency contacts for a patient
   - Add, edit, and delete emergency contacts

5. **Legal Tutors View**:
   - List of legal tutors for a patient
   - Add, edit, and delete legal tutors

**Notifications**: Success and error messages appear as animated notifications in the top-right corner.

## Development Workflow

1. Run `npm install` to install dependencies (including Better-SQLite3, TSyringe)
2. Use `npm run dev` to start development mode
3. The app automatically recompiles TypeScript on save
4. HTML/CSS changes are watched and copied to dist automatically
5. DevTools open automatically in development mode
6. Database file is created automatically on first run (async initialization)
7. Migrations are automatically applied on initialization

## Adding Features

### Adding a New Domain

1. Create domain folder structure:
   ```
   src/main/domains/<domain-name>/
   ├── repository/
   │   └── <domain>-repository.ts
   ├── service/
   │   └── <domain>-service.ts
   └── usecases/  (if needed)
       └── <usecase>-usecase.ts
   ```

2. Create type definitions in `src/types/<domain>.ts`

3. Add database migration in `src/main/database/migrations/`

4. Implement repository extending BaseRepository:
   ```typescript
   @injectable()
   export class MyRepository extends BaseRepository<Entity, CreateInput, UpdateInput> {
     constructor(@inject(DATABASE_DRIVER) driver: DatabaseDriver) {
       super(driver, 'table_name');
     }
   }
   ```

5. Implement service:
   ```typescript
   @injectable()
   export class MyService {
     constructor(private myRepository: MyRepository) {}
   }
   ```

6. Register in DatabaseService:
   - Add private field for service
   - Resolve from container in `initialize()`
   - Add getter method

7. Create IPC handlers in `src/main/handlers/<domain>/index.ts`

8. Register handlers in `src/main/main.ts` `setupIpcHandlers()`

9. Update preload script to expose IPC channels

10. Update renderer UI as needed

### Adding a Cross-Domain Operation

1. Create use case in appropriate domain's `usecases/` folder
2. Inject required services via constructor
3. Decorate with `@injectable()`
4. Implement `execute()` method
5. Register in DatabaseService (resolve from container + add getter)
6. Use in IPC handlers

### Database Migrations

**Creating a Migration**:
1. Create new SQL file in `src/main/database/migrations/`
2. Name format: `YYYY.MM.DDTHH.mm.ss.description.sql`
3. Write SQL commands (CREATE TABLE, ALTER TABLE, etc.)
4. Migration will auto-apply on next app start

**Example Migration**:
```sql
-- Up
CREATE TABLE IF NOT EXISTS my_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now'))
);

-- Down
DROP TABLE IF EXISTS my_table;
```

### Adding IPC Channels to Existing Domain

1. Add handler function in domain's handler file
2. Use domain service from DatabaseService
3. Follow standard error handling pattern
4. Update preload script to expose channel
5. Update renderer to call new channel

## Building for Production

The project uses Electron Forge for building distributables:

- **Windows**: Squirrel installer
- **macOS**: ZIP archive
- **Linux**: DEB and RPM packages

Configure makers in `forge.config.js` for platform-specific build options.

**Note**: Better-SQLite3 requires native compilation but Electron Forge handles this automatically with electron-rebuild.

## Testing Strategy

- **Unit Tests**: Test services with mocked repositories
- **Integration Tests**: Test use cases with real repositories
- **Repository Tests**: Test data access with test database
- **Mock IoC**: Use TSyringe's test container for mocking

**Mocking Example**:
```typescript
import { container } from 'tsyringe';

// Mock repository
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
};

container.registerInstance(PatientRepository, mockRepository);
const service = container.resolve(PatientService);
```

## Architecture Principles Summary

**SOLID Principles**:
- ✅ Single Responsibility: Each class has one purpose
- ✅ Open/Closed: Extensible via inheritance (BaseRepository)
- ✅ Liskov Substitution: Repositories extend base without breaking contract
- ✅ Interface Segregation: Small, focused interfaces
- ✅ Dependency Inversion: High-level modules use abstractions (IoC)

**Clean Architecture**:
- ✅ Separation of concerns across layers
- ✅ Domain logic isolated from infrastructure
- ✅ Dependencies point inward (toward domain)
- ✅ Use cases orchestrate complex operations

**Domain-Driven Design**:
- ✅ Clear domain boundaries
- ✅ Domain models (Patient, Note, etc.)
- ✅ Repositories for data access
- ✅ Services for domain logic
- ✅ Use cases for complex operations

## File References

- Main entry: src/main/main.ts:1
- Database service: src/main/database/database-service.ts:1
- Database driver: src/main/database/driver/database-driver.ts:1
- IoC container: src/main/infrastructure/ioc/container.ts:1
- Migration config: src/main/database/migrations/umzug.ts:1
- Base repository: src/main/database/repositories/base-repository.ts:1
- Patient service: src/main/domains/patient/service/patient-service.ts:1
- Note service: src/main/domains/note/service/note-service.ts:1
- Create note use case: src/main/domains/note/usecases/create-note-usecase.ts:1
- Patient handlers: src/main/handlers/patient/index.ts:1
- Backup service: src/main/infrastructure/backup/backup-service.ts:1
- Preload bridge: src/preload/preload.ts:1
- Renderer logic: src/renderer/renderer.ts:1
- UI markup: src/renderer/index.html:1
- Styles: src/renderer/styles.scss:1
- TypeScript config: tsconfig.json:1
- Forge config: forge.config.js:1

## User Memory Items

- When create some component style file, istead of using next notation <component-name>.style.[css|scss|sass], use just style.[css|scss|sass]
- Backend folder struccture should be next: main/database/migrations, main/database/driver, main/domains, main/<domain-name>/[service|repository|usecases]. Service folder should contain bussines logic related just to the main domain, service also can only import its own domain repository. Repository should contain data logic (transformations, auto generations, etc) and should receive a DB driver as constructor parameter. UseCases are complex domain operations that can include multiple other domain services or use cases.
