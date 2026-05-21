import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../atoms/Button/Button';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
  buttonText,
}) => {
  const { t } = useTranslation();

  const handleSearch = () => {
    onSearch(value);
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
          placeholder={placeholder ?? `${t('common.search')}...`}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="control">
        <Button variant="info" onClick={handleSearch}>
          {buttonText ?? t('common.search')}
        </Button>
      </div>
    </div>
  );
};
