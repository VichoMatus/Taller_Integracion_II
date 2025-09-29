'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import './Footer.css';
import styles from './Footer.module.css';

interface FooterProps {
  variant?: 'minimal' | 'full';
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ variant = 'minimal', className = '' }) => {
  const pathname = usePathname();
  
  // Detectar si estamos en cualquier ruta dentro de /sports
  const isInSportsSection = pathname?.startsWith('/sports');
  
  if (isInSportsSection) {
    // Usar CSS Modules para rutas de /sports
    const footerClass = variant === 'full' ? styles.footerFull : styles.footerMinimal;
    const sidebarClass = styles.footerWithSidebar; // Siempre con sidebar en sports
    
    return (
      <footer className={`${footerClass} ${sidebarClass} ${className}`.trim()}>
        <div className={variant === 'full' ? styles.footerFullContent : styles.footerMinimalContent}>
          {variant === 'full' ? (
            <div>
              <div className={styles.footerLinks}>
                <span>© 2025 SportHub Temuco. Todos los derechos reservados.</span>
              </div>
            </div>
          ) : (
            <span className={styles.footerMinimalText}>
              © 2025 SportHub Temuco. Todos los derechos reservados.
            </span>
          )}
        </div>
      </footer>
    );
  } else {
    // Usar CSS normal para otras rutas
    const footerClass = variant === 'full' ? 'footer-full' : 'footer-minimal';
    
    return (
      <footer className={`${footerClass} ${className}`.trim()}>
        <div className={variant === 'full' ? 'footer-full-content' : 'footer-minimal-text'}>
          {variant === 'full' ? (
            <div>
              <div className="footer-links">
                <span>© 2025 SportHub Temuco. Todos los derechos reservados.</span>
              </div>
            </div>
          ) : (
            '© 2025 SportHub Temuco. Todos los derechos reservados.'
          )}
        </div>
      </footer>
    );
  }
};

export default Footer;