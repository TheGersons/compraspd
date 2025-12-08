import React from 'react';
import { ShimmerButton } from './shinner';

export const ShimmerButtonExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="space-y-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Shimmer Button Examples
        </h1>

        {/* Primary Variants */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Primary Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton size="sm" onClick={() => alert('Small button clicked!')}>
              Small Button
            </ShimmerButton>
            
            <ShimmerButton size="md" onClick={() => alert('Medium button clicked!')}>
              Contáctanos
            </ShimmerButton>
            
            <ShimmerButton size="lg" onClick={() => alert('Large button clicked!')}>
              Large Button
            </ShimmerButton>
          </div>
        </div>

        {/* With Icons */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            With Icons
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              Email Us
            </ShimmerButton>

            <ShimmerButton>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3" 
                />
              </svg>
              Get Started
            </ShimmerButton>
          </div>
        </div>

        {/* Secondary Variant */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Secondary Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton variant="secondary">
              Secondary Action
            </ShimmerButton>
            
            <ShimmerButton variant="secondary" size="lg">
              Learn More
            </ShimmerButton>
          </div>
        </div>

        {/* Outline Variant */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Outline Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton variant="outline">
              Outline Style
            </ShimmerButton>
            
            <ShimmerButton variant="outline" size="lg">
              Contact Sales
            </ShimmerButton>
          </div>
        </div>

        {/* Custom Shimmer Color */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Custom Shimmer Colors
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton shimmerColor="rgba(255, 215, 0, 0.5)">
              Gold Shimmer
            </ShimmerButton>
            
            <ShimmerButton shimmerColor="rgba(255, 105, 180, 0.4)">
              Pink Shimmer
            </ShimmerButton>
            
            <ShimmerButton 
              variant="secondary"
              shimmerColor="rgba(147, 197, 253, 0.6)"
            >
              Blue Shimmer
            </ShimmerButton>
          </div>
        </div>

        {/* Dark Background Example */}
        <div className="bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            On Dark Background
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton>
              Contáctanos
            </ShimmerButton>
            
            <ShimmerButton variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </ShimmerButton>
          </div>
        </div>

        {/* Disabled State */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Disabled State
          </h2>
          <div className="flex flex-wrap gap-4">
            <ShimmerButton disabled className="opacity-50 cursor-not-allowed">
              Disabled Button
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerButtonExample;