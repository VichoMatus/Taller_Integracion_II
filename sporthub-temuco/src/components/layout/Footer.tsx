import React from 'react';
import './Footer.css';

interface FooterProps {
  variant?: 'minimal' | 'full';
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ variant = 'minimal', className = '' }) => {
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
};

export default Footer;
