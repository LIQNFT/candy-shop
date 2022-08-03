import React, { useRef, useState } from 'react';
import { IconSearch } from 'assets/IconSearch';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import './style.less';

interface SearchProps {
  onSearch: (search: string) => void;
  placeholder?: string;
}

const DEBOUNCE_TIME = 300;
export const Search: React.FC<SearchProps> = ({ onSearch, placeholder = '' }) => {
  const [keyword, setKeyword] = useState<string>('');
  const prevKeyword = useRef(keyword);
  const onSearchRef = useRef(onSearch);
  if (onSearch !== onSearchRef.current) {
    onSearchRef.current = onSearch;
  }

  const timeout = useUnmountTimeout();

  if (keyword !== prevKeyword.current) {
    prevKeyword.current = keyword;
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onSearchRef.current(keyword), DEBOUNCE_TIME);
  }

  return (
    <div className="candy-search">
      <IconSearch />
      <input
        placeholder={placeholder}
        value={keyword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
      />
    </div>
  );
};
