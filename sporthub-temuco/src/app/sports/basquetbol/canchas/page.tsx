'use client';
import React, { useState } from 'react';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';

const canchas = [
  {
    imageUrl: '/img/cancha.jpg',
    name: 'Basquetbol - (Nombre)',
    address: '(Dirección)',
    rating: 4.8,
    reviews: 120,
    tags: ['Cancha Cerrada', 'Estacionamiento', 'Iluminación'],
    description: 'Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)',
    price: 'Precio',
  },
  {
    imageUrl: '/img/cancha.jpg',
    name: 'Basquetbol - (Nombre)',
    address: '(Dirección)',
    rating: 4.8,
    reviews: 120,
    tags: ['Cancha Cerrada', 'Estacionamiento', 'Iluminación'],
    description: 'Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)',
    price: 'Precio',
  },
  {
    imageUrl: '/img/cancha.jpg',
    name: 'Basquetbol - (Nombre)',
    address: '(Dirección)',
    rating: 4.8,
    reviews: "(120)",
    tags: ['Cancha Cerrada', 'Estacionamiento', 'Iluminación'],
    description: 'Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)',
    price: 'Precio',
  },
  {
    imageUrl: '/img/cancha.jpg',
    name: 'Basquetbol - (Nombre)',
    address: '(Dirección)',
    rating: 4.8,
    reviews: 120,
    tags: ['Cancha Cerrada', 'Estacionamiento', 'Iluminación', 'Cafetería'],
    description: 'Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)',
    price: 'Precio',
  },
];

export default function Page() {
  const [search, setSearch] = useState('');

  // Filtrado simple por nombre (puedes mejorar la lógica)
  const filteredCanchas = canchas.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-center mb-6">
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={() => {}}
          placeholder="Buscar canchas de basquetbol 🔍..."
        />
      </div>
      <div className="flex flex-wrap justify-center bg-orange-100 p-6 rounded-xl gap-[17px]">
        {filteredCanchas.map((cancha, idx) => (
          <CourtCard key={idx} {...cancha} />
        ))}
      </div>
    </div>
  );
}