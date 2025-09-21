// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, ...props }: InputProps) {
  return (
    <input
      className={`
        px-3 py-3
        border border-gray-400/30
        rounded-md
        bg-white
        shadow-sm
        hover:border-gray-500/40
        hover:shadow
        focus:outline-none
        focus:ring-1 focus:ring-blue-300 focus:ring-opacity-25
        focus:border-blue-300
        transition-all duration-200
        placeholder:text-gray-400
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${error ? "border-red-400 focus:border-red-400 focus:ring-red-300 focus:ring-opacity-25" : ""}
      `}
      {...props}
    />
  );
}

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", ...props }: ButtonProps) {
  const baseClasses = `
    px-4 py-2
    rounded-md
    font-medium
    transition-all duration-200
    shadow-sm
    focus:outline-none focus:ring-1 focus:ring-opacity-30
  `;

  const variants = {
    primary: `
      bg-blue-500 text-white
      hover:bg-blue-600
      focus:ring-blue-300
    `,
    secondary: `
      bg-gray-200 text-gray-800
      hover:bg-gray-300
      focus:ring-gray-400
    `,
  };

  return <button className={`${baseClasses} ${variants[variant]}`} {...props} />;
}
