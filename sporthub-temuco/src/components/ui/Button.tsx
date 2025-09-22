'use client';

import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: React.ReactNode;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  disabled,
  icon,
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={`button ${variant} ${size} ${disabled || isLoading ? 'disabled' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="loading-spinner" />
      )}
      {icon && !isLoading && (
        <span className="button-icon">{icon}</span>
      )}
      {children}
    </button>
  );
}

export default Button;