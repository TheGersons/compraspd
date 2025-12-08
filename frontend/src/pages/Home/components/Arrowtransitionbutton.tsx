import React, { ButtonHTMLAttributes } from 'react';

interface ArrowTransitionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  hoverBgColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  arrowIcon?: React.ReactNode;
}

export const ArrowTransitionButton: React.FC<ArrowTransitionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  hoverBgColor = 'bg-cyan-500',
  hoverTextColor = 'text-white',
  borderColor = 'border-cyan-500',
  arrowIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'arrow-button relative font-medium transition-all duration-500 rounded-full border-2 inline-flex items-center justify-center';
  
  const variantStyles = {
    primary: `bg-transparent ${borderColor} text-cyan-500 hover:${hoverTextColor}`,
    secondary: `bg-transparent border-gray-400 text-gray-700 hover:text-white`,
    custom: `bg-transparent ${borderColor}`,
  };
  
  const sizeStyles = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const defaultArrow = (
    <svg 
      className="w-5 h-5" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={2.5}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M13 7l5 5m0 0l-5 5m5-5H6" 
      />
    </svg>
  );

  return (
    <>
      <style>{`
        .arrow-button {
          overflow: clip;
        }
        
        /* Posición inicial de la flecha: A LA IZQUIERDA del botón */
        .arrow-animated {
          transform: translateX(-rem);
          transition: transform 700ms ease-in-out;
        }
        
        /* Posición final al hacer hover: A LA DERECHA del botón (fuera) */
        .arrow-button:hover .arrow-animated {
          transform: translateX(calc(9vw));
        }
      `}</style>
      
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
        {/* Background color fill */}
        <span 
          className={`
            absolute inset-0 ${hoverBgColor} 
            -translate-x-full 
            group-hover:translate-x-0 
            transition-transform duration-500 ease-out
            rounded-full
          `}
        />
        
        {/* Arrow wrapper */}
        <span 
          className="absolute inset-0 overflow-visible pointer-events-none flex items-center z-20"
        >
          <span className={`arrow-animated ${hoverTextColor}`}>
            {arrowIcon || defaultArrow}
          </span>
        </span>
        
        {/* Button text */}
        <span className="relative z-10 transition-colors duration-300">
          {children}
        </span>
      </button>
    </>
  );
};