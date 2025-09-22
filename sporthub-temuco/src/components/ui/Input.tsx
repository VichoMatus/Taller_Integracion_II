'use client';

import './Input.css';

interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  // Props nativas de input
  autoComplete?: string;
  autoFocus?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

const Input = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  type = 'text',
  ...props 
}: InputProps) => {
  return (
    <div className="input-container">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {type === 'search' && (
        <button className="search-button" type="button">
          🔍
        </button>
      )}
      {(error || helperText) && (
        <p className={error ? 'error-message' : 'helper-text'}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;