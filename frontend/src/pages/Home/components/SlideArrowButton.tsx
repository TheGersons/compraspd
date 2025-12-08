import React, { ButtonHTMLAttributes } from 'react';

interface SlideArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  arrowIcon?: React.ReactNode;
  width?: string;
}

export const SlideArrowButton: React.FC<SlideArrowButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  showArrow = true,
  arrowIcon,
  width,
  className = '',
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden font-medium transition-all duration-300 rounded-full inline-flex items-center justify-center gap-2' + (width ? ` w-${width} ` : '');
  
  const variantStyles = {
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg ',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-lg',
    outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm ',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const defaultArrow = (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5l7 7-7 7" 
      />
    </svg>
  );

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
      {/* Button text */}
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Animated arrow container */}
      {showArrow && (
        <span className="relative w-4 h-4 overflow-hidden">
          {/* First arrow - visible by default, slides out to the right */}
          <span className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-6">
            {arrowIcon || defaultArrow}
          </span>
          
          {/* Second arrow - hidden on left, slides in from the left */}
          <span className="absolute inset-0 -translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
            {arrowIcon || defaultArrow}
          </span>
        </span>
      )}
    </button>
  );
};