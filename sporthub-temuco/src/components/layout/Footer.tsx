"use client";

// Footer.tsx - Actualizado
import React from 'react';
import { usePathname } from 'next/navigation';
import './Footer.css';
import styles from './Footer.module.css';

interface FooterProps {
    variant?: 'minimal' | 'full';
    layout?: 'with-sidebar' | 'without-sidebar';
    className?: string;
    useModuleCSS?: boolean; 
}

const Footer: React.FC<FooterProps> = ({ 
    variant = 'minimal', 
    layout,
    className = '',
    useModuleCSS 
}) => {
    const pathname = usePathname();
    
    // 🔥 DETECTAR SI VIENE DESDE LA PÁGINA DE SPORTS
    const isFromSportsPage = pathname?.startsWith('/sports');
    
    // 🔥 DETECTAR SI ES PÁGINA DE LOGIN O REGISTRO
    const isLoginPage = pathname === '/login' || 
                   pathname === '/login/registro' || 
                   pathname === '/login/verificar' ||
                   pathname === '/login/forgot-password' ||
                   pathname === '/login/reset-password';

    // 🔥 USA MODULE.CSS SI VIENE DE SPORTS O SI SE ESPECIFICA MANUALMENTE
    const shouldUseModuleCSS = useModuleCSS ?? isFromSportsPage;

    const finalLayout = isLoginPage ? 'without-sidebar' : (layout ?? 'without-sidebar');

    // 🔥 LÓGICA CONDICIONAL SIMPLE PARA CLASES
    const footerLayoutClass = shouldUseModuleCSS 
        ? (finalLayout === 'with-sidebar' ? styles.footerWithSidebar : styles.footerWithoutSidebar)
        : (finalLayout === 'with-sidebar' ? 'footer-sidebar' : 'footer-login');
    
    const contentClass = shouldUseModuleCSS
        ? (variant === 'full' ? styles.footerFullContent : styles.footerMinimalContent)
        : (variant === 'full' ? 'footer-content' : 'footer-minimal');
    
    const textClass = shouldUseModuleCSS 
        ? styles.footerMinimalText 
        : 'footer-minimal-text';
    
    return (
        <footer className={`${footerLayoutClass} ${className}`.trim()}>
            <div className={contentClass}>
                {variant === 'full' ? (
                    <div>
                        <div className={shouldUseModuleCSS ? styles.footerLinks : 'footer-links'}>
                            <span>© 2025 SportHub Temuco. Todos los derechos reservados.</span>
                        </div>
                    </div>
                ) : (
                    <span className={textClass}>
                        © 2025 SportHub Temuco. Todos los derechos reservados.
                    </span>
                )}
            </div>
        </footer>
    );
};

export default Footer;