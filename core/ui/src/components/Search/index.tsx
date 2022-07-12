import React, { useEffect, useState } from 'react';
import { IconSearch } from 'assets/IconSearch';
import './style.less';

interface SearchProps {
  onSearch: (search: string) => void;
  placeholder?: string;
}

const DEBOUNCE_TIME = 300;
export const Search: React.FC<SearchProps> = ({ onSearch, placeholder = '' }) => {
  const [keyword, setKeyword] = useState<string>();

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(keyword || ''), DEBOUNCE_TIME);
    return () => clearTimeout(timeout);
  }, [keyword, onSearch]);

  return (
    <div className="candy-search">
      <IconSearch />
      <input
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
      />
    </div>
  );
};
