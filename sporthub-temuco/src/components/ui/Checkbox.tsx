'use client';

interface CheckboxProps {
  label?: string;
  error?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Checkbox = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}: CheckboxProps) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {label && (
        <label
          htmlFor={props.id}
          className="ml-2 block text-sm text-gray-900"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;