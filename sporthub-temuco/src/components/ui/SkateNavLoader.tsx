"use client";

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import skateStyles from '@/app/sports/skate/skate.module.css';

let root: Root | null = null;

export function mountSkateLoader() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('skate-nav-loader')) return;

  const container = document.createElement('div');
  container.id = 'skate-nav-loader';
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(
    <div className={skateStyles.navLoader}>
      <div className={skateStyles.navLoaderInner}>
        <div className={skateStyles.navLoaderIcon}>🛹</div>
        <div className={skateStyles.navLoaderText}>Cargando skatepark...</div>
      </div>
    </div>
  );
}

export function unmountSkateLoader() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('skate-nav-loader');
  if (container && root) {
    root.unmount();
    container.remove();
    root = null;
  } else if (container) {
    container.remove();
  }
}

export default function SkateNavLoader() {
  return null;
}
