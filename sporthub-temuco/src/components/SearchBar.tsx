'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import indexStyles from './stylesSearchBar/IndexSearchBar.module.css';
import basquetbolStyles from './stylesSearchBar/BasquetbolSearchBar.module.css';
import futbolStyles from './stylesSearchBar/FutbolSearchBar.module.css';
import padelStyles from './stylesSearchBar/PadelSearchBar.module.css';
import crossfitentrenamientofuncionalStyles from './stylesSearchBar/CrossfitEntrenamientoFuncionalSearchBar.module.css';
import tenisStyles from './stylesSearchBar/TenisSearchBar.module.css';
import voleiStyles from './stylesSearchBar/VoleibolSearchBar.module.css';
import natacionStyles from './stylesSearchBar/NatacionSearchBar.module.css';
import patinaje from './stylesSearchBar/PatinajeSearchBar.module.css';
import escaladaStyles from './stylesSearchBar/EscaladaSearchBar.module.css';

interface SearchBarProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (term: string) => void;
  placeholder?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje'| 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike' |'escalada';
}

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Buscar...",
  sport 
}: SearchBarProps) => {
  const pathname = usePathname();
  const [internalValue, setInternalValue] = useState(value || '');

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
        return futbolStyles; // temporal
      case 'tenis':
       return tenisStyles; // Cuando lo crees
      case 'voleibol':
        return voleiStyles; 
      case 'padel':
        return padelStyles;
      case 'crossfitentrenamientofuncional':
        return crossfitentrenamientofuncionalStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinaje;
      case 'escalada':
        return escaladaStyles;
      default:
        return indexStyles; // fallback al index
    }
  };

  const styles = getSearchStyles();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const handleSearch = () => {
    onSearch(internalValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(internalValue);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchIcon}>
        🔍
      </div>
      <input
        type="text"
        value={value !== undefined ? value : internalValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      <button
        onClick={handleSearch}
        className={styles.searchButton}
        type="button"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;