import React from 'react';
import styles from './stylesSearchBar/BasquetbolSearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void; // Solo se ejecuta cuando se hace clic en buscar
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar por nombre...",
}) => {
  const handleIconClick = () => {
    onSearch(); // Ejecuta búsqueda solo al hacer clic
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(); // También permite buscar con Enter
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        value={value}
        onChange={onChange} // Solo actualiza el estado, no busca
        placeholder={placeholder}
        className={styles.searchInput}
        onKeyDown={handleKeyPress}
      />
      <div 
        className={styles.searchIconContainer}
        onClick={handleIconClick}
        title="Buscar" // Tooltip para mejor UX
      >
        <svg 
          className={styles.searchIcon} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;