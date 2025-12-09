import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('should render search input', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Search patients..." />);

    const input = screen.getByPlaceholderText('Search patients...');
    expect(input).toBeInTheDocument();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should update input value when user types', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(input.value).toBe('test query');
  });

  it('should render search button with default text', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('should render search button with custom text', () => {
    render(<SearchBar onSearch={jest.fn()} buttonText="Find" />);

    const button = screen.getByRole('button', { name: /find/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onSearch when button is clicked', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('should call onSearch when enter key is pressed', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('should handle empty search query', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('should initialize with initial value', () => {
    render(<SearchBar onSearch={jest.fn()} initialValue="initial" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
  });

  it('should call onSearch with initial value when button clicked', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} initialValue="initial" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleSearch).toHaveBeenCalledWith('initial');
  });
});
