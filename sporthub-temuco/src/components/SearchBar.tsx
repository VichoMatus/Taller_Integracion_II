'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import indexStyles from './stylesSearchBar/IndexSearchBar.module.css';
import basquetbolStyles from './stylesSearchBar/BasquetbolSearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  placeholder?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel';
}

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Buscar...",
  sport 
}: SearchBarProps) => {
  const pathname = usePathname();

  // 🔥 Función para obtener los estilos según la ubicación
  const getSearchStyles = () => {
    // Si está en el index o página de deportes principal, usar IndexSearchBar
    if (pathname === '/' || pathname === '/sports' || pathname === '/sports/') {
      return indexStyles;
    }

    // Para páginas específicas de deportes, usar los estilos correspondientes
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        // return futbolStyles; // Cuando lo crees
        return basquetbolStyles; // temporal
      case 'tenis':
        // return tenisStyles; // Cuando lo crees
        return indexStyles; // temporal
      default:
        return indexStyles; // fallback al index
    }
  };

  const styles = getSearchStyles();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchIcon}>
        🔍
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      <button
        onClick={onSearch}
        className={styles.searchButton}
        type="button"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;