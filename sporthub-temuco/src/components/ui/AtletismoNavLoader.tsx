'use client';

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import atletismoStyles from '@/app/sports/atletismo/atletismo.module.css';

let root: Root | null = null;

export function mountAtletismoLoader() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('atletismo-nav-loader')) return;

  const container = document.createElement('div');
  container.id = 'atletismo-nav-loader';
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(
    <div className={atletismoStyles.navLoader}>
      <div className={atletismoStyles.navLoaderInner}>
        <div className={atletismoStyles.navLoaderIcon}>🏃‍♂️</div>
        <div className={atletismoStyles.navLoaderText}>Cargando pista de Atletismo...</div>
      </div>
    </div>
  );
}

export function unmountAtletismoLoader() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('atletismo-nav-loader');
  if (container && root) {
    root.unmount();
    container.remove();
    root = null;
  } else if (container) {
    container.remove();
  }
}

export default function AtletismoNavLoader() {
  // This component is not intended to be used via JSX; mount/unmount helpers are preferred.
  return null;
}
