import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientList } from './PatientList';
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';
import {
  Patient,
  PatientStatus,
  Gender,
  MaritalStatus,
  SexualOrientation,
} from '../../../types/patient';

// Mock hooks
jest.mock('../../hooks/usePatients');
jest.mock('../../context/NotificationContext');

const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    phoneNumber: '1234567890',
    birthDate: '1993-01-01',
    maritalStatus: 'single' as MaritalStatus,
    gender: 'male' as Gender,
    sexualOrientation: 'prefer_not_to_say' as SexualOrientation,
    educationalLevel: 'Bachelor',
    profession: 'Engineer',
    livesWith: 'Alone',
    children: 0,
    status: PatientStatus.ACTIVE,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    email: 'jane@example.com',
    phoneNumber: '0987654321',
    birthDate: '1995-05-15',
    maritalStatus: 'married' as MaritalStatus,
    gender: 'female' as Gender,
    sexualOrientation: 'prefer_not_to_say' as SexualOrientation,
    educationalLevel: 'Master',
    profession: 'Doctor',
    livesWith: 'Spouse',
    children: 1,
    status: PatientStatus.PAUSED,
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
  },
];

describe('PatientList Component', () => {
  const mockLoadPatients = jest.fn();
  const mockSearchPatients = jest.fn();
  const mockOnAddPatient = jest.fn();
  const mockOnViewPatient = jest.fn();
  const mockOnViewNotes = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    (usePatients as jest.Mock).mockReturnValue({
      patients: mockPatients,
      loading: false,
      error: null,
      loadPatients: mockLoadPatients,
      searchPatients: mockSearchPatients,
    });

    (useNotification as jest.Mock).mockReturnValue({
      showError: mockShowError,
    });

    jest.clearAllMocks();
  });

  it('should render patient list', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should load patients on mount', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(mockLoadPatients).toHaveBeenCalledTimes(1);
  });

  it('should display loading spinner when loading', () => {
    (usePatients as jest.Mock).mockReturnValue({
      patients: [],
      loading: true,
      error: null,
      loadPatients: mockLoadPatients,
      searchPatients: mockSearchPatients,
    });

    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(screen.getByText(/loading patients/i)).toBeInTheDocument();
  });

  it('should display status filter dropdown', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const statusFilter = screen.getByLabelText(/filter by status/i);
    expect(statusFilter).toBeInTheDocument();
    expect(statusFilter).toHaveValue('all');
  });

  it('should change status filter and trigger search', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const statusFilter = screen.getByLabelText(/filter by status/i);

    fireEvent.change(statusFilter, { target: { value: 'active' } });

    expect(mockSearchPatients).toHaveBeenCalledWith('', 'active');
  });

  it('should display search bar', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should call searchPatients when search button is clicked', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'john' } });
    fireEvent.click(searchButton);

    // Check that search was called
    expect(mockSearchPatients).toHaveBeenCalledWith('john', undefined);
  });

  it('should display Add Patient button', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const addButton = screen.getByRole('button', { name: /add patient/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should call onAddPatient when Add Patient button is clicked', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const addButton = screen.getByRole('button', { name: /add patient/i });
    fireEvent.click(addButton);

    expect(mockOnAddPatient).toHaveBeenCalledTimes(1);
  });

  it('should display patient information in table', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display status badges with correct colors', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    // Get all elements with status text and filter for badges (span elements)
    const statusBadges = screen.getAllByText('Active').filter((el) => el.tagName === 'SPAN');
    const pausedBadges = screen.getAllByText('Paused').filter((el) => el.tagName === 'SPAN');

    expect(statusBadges[0]).toHaveClass('tag', 'is-success');
    expect(pausedBadges[0]).toHaveClass('tag', 'is-warning');
  });

  it('should call onViewNotes when Notes button is clicked', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const notesButtons = screen.getAllByRole('button', { name: /notes/i });
    fireEvent.click(notesButtons[0]);

    expect(mockOnViewNotes).toHaveBeenCalledWith(mockPatients[0]);
  });

  it('should call onViewPatient when Info button is clicked', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    const infoButtons = screen.getAllByRole('button', { name: /info/i });
    fireEvent.click(infoButtons[0]);

    expect(mockOnViewPatient).toHaveBeenCalledWith(mockPatients[0]);
  });

  it('should display empty state message when no patients', () => {
    (usePatients as jest.Mock).mockReturnValue({
      patients: [],
      loading: false,
      error: null,
      loadPatients: mockLoadPatients,
      searchPatients: mockSearchPatients,
    });

    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
  });

  it('should display filtered empty state when filters exclude all results', () => {
    (usePatients as jest.Mock).mockReturnValue({
      patients: [],
      loading: false,
      error: null,
      loadPatients: mockLoadPatients,
      searchPatients: mockSearchPatients,
    });

    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    // Change status filter
    const statusFilter = screen.getByLabelText(/filter by status/i);
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    expect(screen.getByText(/no patients match the selected filters/i)).toBeInTheDocument();
  });

  it('should show error notification when error occurs', () => {
    const error = new Error('Failed to load patients');
    (usePatients as jest.Mock).mockReturnValue({
      patients: [],
      loading: false,
      error,
      loadPatients: mockLoadPatients,
      searchPatients: mockSearchPatients,
    });

    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    expect(mockShowError).toHaveBeenCalledWith('Failed to load patients');
  });

  it('should combine search and status filters', () => {
    render(
      <PatientList
        onAddPatient={mockOnAddPatient}
        onViewPatient={mockOnViewPatient}
        onViewNotes={mockOnViewNotes}
      />
    );

    // Set status filter
    const statusFilter = screen.getByLabelText(/filter by status/i);
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    // Type in search and click search button
    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'john' } });
    fireEvent.click(searchButton);

    // Check that search was called with both filters
    expect(mockSearchPatients).toHaveBeenCalledWith('john', 'active');
  });
});
