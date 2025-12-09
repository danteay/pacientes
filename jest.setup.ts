import '@testing-library/jest-dom';

// Mock window.api for renderer tests
global.window = Object.create(window);
Object.defineProperty(window, 'api', {
  value: {
    patient: {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    },
    note: {
      create: jest.fn(),
      getByPatientId: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    backup: {
      export: jest.fn(),
      import: jest.fn(),
      onImportProgress: jest.fn(),
      removeImportProgressListener: jest.fn(),
    },
  },
  writable: true,
});
