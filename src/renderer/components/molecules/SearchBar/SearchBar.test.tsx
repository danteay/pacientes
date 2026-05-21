import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

interface HarnessProps {
  initialValue?: string;
  onSearch?: (term: string) => void;
  placeholder?: string;
  buttonText?: string;
}

const Harness: React.FC<HarnessProps> = ({
  initialValue = '',
  onSearch = jest.fn(),
  placeholder,
  buttonText,
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onSearch={onSearch}
      placeholder={placeholder}
      buttonText={buttonText}
    />
  );
};

describe('SearchBar Component', () => {
  it('should render search input', () => {
    render(<Harness />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<Harness placeholder="Search patients..." />);
    expect(screen.getByPlaceholderText('Search patients...')).toBeInTheDocument();
  });

  it('should render with default placeholder', () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should update input value when user types', () => {
    render(<Harness />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');
  });

  it('should render search button with default text', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should render search button with custom text', () => {
    render(<Harness buttonText="Find" />);
    expect(screen.getByRole('button', { name: /find/i })).toBeInTheDocument();
  });

  it('should call onSearch when button is clicked', () => {
    const handleSearch = jest.fn();
    render(<Harness onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('should call onSearch when enter key is pressed', () => {
    const handleSearch = jest.fn();
    render(<Harness onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('should handle empty search query', () => {
    const handleSearch = jest.fn();
    render(<Harness onSearch={handleSearch} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('should initialize with initial value', () => {
    render(<Harness initialValue="initial" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
  });

  it('should call onSearch with initial value when button clicked', () => {
    const handleSearch = jest.fn();
    render(<Harness onSearch={handleSearch} initialValue="initial" />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleSearch).toHaveBeenCalledWith('initial');
  });
});
