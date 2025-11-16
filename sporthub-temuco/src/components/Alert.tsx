import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  onClose,
  autoClose = false,
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`${styles.alertOverlay}`}>
      <div className={`${styles.alert} ${styles[type]}`}>
        <div className={styles.alertIcon}>
          {icons[type]}
        </div>
        <div className={styles.alertContent}>
          <p className={styles.alertMessage}>{message}</p>
        </div>
        {onClose && (
          <button 
            className={styles.alertClose}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
