// Footer.tsx - Actualizado
import React from 'react';
import { usePathname } from 'next/navigation';
import './Footer.css';
import styles from './Footer.module.css';

interface FooterProps {
    variant?: 'minimal' | 'full';
    layout?: 'with-sidebar' | 'without-sidebar';
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ 
    variant = 'minimal', 
    layout = 'without-sidebar',
    className = '' 
}) => {
    const footerLayoutClass = layout === 'with-sidebar' ? 'footer-sidebar' : 'footer-login';
    
    return (
        <footer className={`${footerLayoutClass} ${className}`.trim()}>
            <div className={variant === 'full' ? 'footer-content' : 'footer-minimal'}>
                {variant === 'full' ? (
                    <div>
                        <div className="footer-links">
                            <span>© 2025 SportHub Temuco. Todos los derechos reservados.</span>
                        </div>
                    </div>
                ) : (
                    <span className="footer-minimal-text">
                        © 2025 SportHub Temuco. Todos los derechos reservados.
                    </span>
                )}
            </div>
        </footer>
    );
};

export default Footer;