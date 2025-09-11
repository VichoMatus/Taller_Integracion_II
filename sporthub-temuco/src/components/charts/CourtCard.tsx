import React from 'react';

interface CourtCardProps {
  imageUrl: string;
  name: string;
  address: string;
  rating: number;
  reviews: string | number;
  tags: string[];
  description: string;
  price: string;
  onClick?: () => void;
}

const CourtCard: React.FC<CourtCardProps> = ({
  imageUrl,
  name,
  address,
  rating,
  reviews,
  tags,
  description,
  price,
  onClick,
}) => (
  <div
    className="bg-white shadow-xl border border-gray-200 flex flex-col overflow-hidden"
    style={{
      width: 342,
      height: 453,
      borderRadius: 12,
    }}
  >
    {/* Imagen */}
    <img
      src={imageUrl}
      alt={name}
      className="w-full object-cover"
      style={{
        height: 160,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    />
    <div className="flex flex-col flex-1 p-5">
      {/* Título y rating */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-lg text-gray-800">{name}</div>
          <div className="text-gray-500 text-xs">{address}</div>
        </div>
        <div className="flex items-center bg-white border border-orange-300 rounded-full px-2 py-0.5 ml-2 shadow-sm">
          <span className="mr-1">
            {/* Icono estrella */}
            <svg className="w-4 h-4 text-yellow-400 inline" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.287-3.967z"/>
            </svg>
          </span>
          <span className="font-semibold text-yellow-700 text-sm">{rating}</span>
          <span className="ml-2 text-xs text-orange-600 font-medium">({reviews} reseñas)</span>
        </div>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 my-3">
        {tags.map(tag => (
          <span
            key={tag}
            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium shadow"
          >
            {tag}
          </span>
        ))}
      </div>
      {/* Descripción */}
      <div className="text-gray-600 text-xs mb-2">{description}</div>
      {/* Precio y botón */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <span className="text-orange-600 font-bold text-base">S/({price})/h</span>
          <div className="text-xs text-gray-400 mt-1">Próximo: 20:00-21:00</div>
        </div>
        <button
          onClick={onClick}
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition text-sm"
        >
          Ir a cancha &rarr;
        </button>
      </div>
    </div>
  </div>
);

export default CourtCard;