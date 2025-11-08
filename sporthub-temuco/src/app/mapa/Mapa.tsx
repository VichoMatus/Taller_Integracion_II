import React, { useEffect, useRef } from 'react';

// 1. DEFINICIÓN DE TIPOS (TypeScript)
// Define la estructura de los datos de un complejo
interface Complejo {
    id: number;
    nombre: string;
    direccion: string;
}

// === DATOS SIMULADOS: Esto debe venir de tu API ===
const complejosSimulados: Complejo[] = [
    { id: 1, nombre: "Complejo Deportivo Central", direccion: "Avenida Libertador Bernardo O'Higgins 1200, Santiago, Chile" },
    { id: 2, nombre: "Canchas del Parque", direccion: "Avenida Francisco Bilbao 4144, Santiago, Chile" },
    { id: 3, nombre: "Club Los Cipreses", direccion: "Av. La Dehesa 1201, Lo Barnechea, Región Metropolitana" }
];
// ==================================================

// Función simulada para la navegación de reservas
const irAReserva = (complejoId: number) => {
    alert(`Dirigiendo a la página de reservas para el Complejo ID: ${complejoId}`);
    // Aquí iría la navegación de React Router: navigate(`/reservas/${complejoId}`);
};

// COMPONENTE PRINCIPAL
const MapImplementation: React.FC = () => {
    // 2. REFERENCIAS (React Hooks)
    // Usamos useRef para mantener la referencia al elemento DIV del mapa
    const mapRef = useRef<HTMLDivElement>(null);

    // 3. EFECTO DE MONTAJE (Inicialización)
    // useEffect se ejecuta una vez que el componente se monta
    useEffect(() => {
        // La API de Google Maps expone la función 'google' globalmente.
        // Asegúrate de que 'google' esté disponible antes de ejecutar.
        if (mapRef.current && typeof window.google !== 'undefined') {
            initMap();
        }
        // Este efecto se ejecuta cuando el componente se monta y solo si la API de Google ya cargó.
    }, []);

    /**
     * Inicializa el mapa y llama a la función para añadir marcadores.
     */
    const initMap = (): void => {
        // Se asume que google.maps está cargado globalmente (gracias al script en index.html)
        const centroSugerido = { lat: -33.4489, lng: -70.6693 }; // Centro en Santiago de Chile
        
        // El tipo 'google.maps.Map' se infiere
        const map = new window.google.maps.Map(mapRef.current!, {
            zoom: 11,
            center: centroSugerido,
            mapTypeId: 'roadmap'
        });

        const geocoder = new window.google.maps.Geocoder();
        
        geocodificarYAgregarMarcadores(map, geocoder, complejosSimulados);
    };

    /**
     * Procesa la lista de complejos, geocodifica y añade marcadores.
     */
    const geocodificarYAgregarMarcadores = (
        map: google.maps.Map, 
        geocoder: google.maps.Geocoder, 
        complejos: Complejo[]
    ): void => {
        
        complejos.forEach((complejo) => {
            
            geocoder.geocode({ 'address': complejo.direccion }, (results, status) => {
                
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    
                    const marker = new window.google.maps.Marker({
                        map: map,
                        position: location, 
                        title: complejo.nombre
                    });
                    
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div>
                                <h4>${complejo.nombre}</h4>
                                <p>${complejo.direccion}</p>
                                <button onclick="window.irAReserva(${complejo.id})">Reservar Ahora</button>
                            </div>
                        `
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });

                } else {
                    console.error(`Geocodificación fallida para ${complejo.nombre}. Estado: ${status}`);
                }
            });
        });
    };

    // 4. RENDERING (JSX)
    // Retorna el DIV que Google Maps usará para renderizar el mapa
    return (
        // Estilo para que el mapa ocupe la pantalla, similar al CSS del ejemplo anterior
        <div 
            ref={mapRef} 
            id="map" 
            style={{ height: '100vh', width: '100%' }}
        />
    );
};

export default MapImplementation;