'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          <p>&copy; 2024 SportHub Temuco. Todos los derechos reservados.</p>
        </div>
        <div className="flex items-center space-x-4">
          <span>Versión 1.0.0</span>
          <span>•</span>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Soporte
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;