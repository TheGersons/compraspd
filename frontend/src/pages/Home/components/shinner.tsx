import React, { ButtonHTMLAttributes } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  shimmerColor?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  shimmerColor = 'rgba(255, 255, 255, 0.3)',
  className = '',
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden font-medium transition-all duration-300 rounded-full';
  
  const variantStyles = {
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-lg',
    outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
        group
      `}
      {...props}
    >
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};