import CourtCard from '../../../../components/charts/CourtCard';

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
    tags: ['Cancha Cerrada', 'Estacionamiento', 'Iluminación'],
    description: 'Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)',
    price: 'Precio',
  },
];

export default function Page() {
  return (
    <div className="flex flex-wrap justify-center bg-orange-100 p-6 rounded-xl gap-[17px]">
      {canchas.map((cancha, idx) => (
        <CourtCard key={idx} {...cancha} />
      ))}
    </div>
  );
}