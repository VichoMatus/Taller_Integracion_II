import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
}) => (
  <div className="relative bg-white rounded-[28px] shadow w-[720px] h-[52px] border border-gray-200 flex items-center">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-[680px] h-full outline-none bg-transparent text-gray-700 font-inter text-base rounded-[28px] pl-4 pr-12 border-transparent"
      onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
    />
    <span className="absolute right-[5px] top-1/2 -translate-y-1/2 flex items-center">
      <svg className="w-14 h-14 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="4" cy="4" r="3" stroke="currentColor" />
        <line x1="12" y1="12" x2="16.65" y2="16.65" stroke="currentColor" />
      </svg>
    </span>
  </div>
);

export default SearchBar;