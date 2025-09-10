'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-full mx-auto py-6 px-6">
        {/* Footer Top - Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">SportHub Temuco</h3>
            <p className="text-sm text-gray-600 mb-4">
              La plataforma que conecta deportistas con los mejores recintos deportivos de Temuco.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/admin/canchas" className="text-gray-600 hover:text-blue-600 transition-colors">Canchas</Link></li>
              <li><Link href="/admin/reservas" className="text-gray-600 hover:text-blue-600 transition-colors">Reservas</Link></li>
              <li><Link href="/admin/estadisticas" className="text-gray-600 hover:text-blue-600 transition-colors">Estadísticas</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ayuda" className="text-gray-600 hover:text-blue-600 transition-colors">Centro de ayuda</Link></li>
              <li><Link href="/contacto" className="text-gray-600 hover:text-blue-600 transition-colors">Contacto</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">Preguntas frecuentes</Link></li>
              <li><Link href="/reportar" className="text-gray-600 hover:text-blue-600 transition-colors">Reportar un problema</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos" className="text-gray-600 hover:text-blue-600 transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/privacidad" className="text-gray-600 hover:text-blue-600 transition-colors">Política de privacidad</Link></li>
              <li><Link href="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">Política de cookies</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom - Copyright */}
        <div className="pt-5 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div>
            <p>&copy; {currentYear} SportHub Temuco. Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span>Versión 1.0.0</span>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;