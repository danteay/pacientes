import React, { useState } from 'react';
import { Button } from '../../atoms/Button/Button';

/**
 * SearchBar Molecule
 *
 * Search input with button
 */

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  buttonText = 'Search',
  initialValue = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="field is-grouped">
      <div className="control is-expanded">
        <input
          type="text"
          placeholder={placeholder}
          className="input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="control">
        <Button variant="info" onClick={handleSearch}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
