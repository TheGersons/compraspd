import React from 'react';
import { SlideArrowButton } from './SlideArrowButton';

export const SlideArrowButtonExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="space-y-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Slide Arrow Button Examples
        </h1>

        {/* Primary Variants */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Tamaños
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            <SlideArrowButton size="sm">
              Pequeño
            </SlideArrowButton>
            
            <SlideArrowButton size="md">
              Contáctanos
            </SlideArrowButton>
            
            <SlideArrowButton size="lg">
              Grande
            </SlideArrowButton>
          </div>
        </div>

        {/* Different Variants */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Variantes
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton variant="primary">
              Primary
            </SlideArrowButton>
            
            <SlideArrowButton variant="secondary">
              Secondary
            </SlideArrowButton>
            
            <SlideArrowButton variant="outline">
              Outline
            </SlideArrowButton>
          </div>
        </div>

        {/* Custom Icons */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Con Iconos Personalizados
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton 
              arrowIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={"200"}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              
            </SlideArrowButton>

            <SlideArrowButton 
              arrowIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            >
              Otra flecha
            </SlideArrowButton>

            <SlideArrowButton 
              variant="secondary"
              arrowIcon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Flecha rellena
            </SlideArrowButton>
          </div>
        </div>

        {/* Without Arrow */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Sin Flecha
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton showArrow={false}>
              Solo Texto
            </SlideArrowButton>
            
            <SlideArrowButton variant="secondary" showArrow={false}>
              Sin Flecha
            </SlideArrowButton>
          </div>
        </div>

        {/* Real Use Cases */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Casos de Uso Reales
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton>
              Ver más información
            </SlideArrowButton>
            
            <SlideArrowButton variant="secondary">
              Explorar servicios
            </SlideArrowButton>
            
            <SlideArrowButton variant="outline">
              Conocer más
            </SlideArrowButton>
          </div>
        </div>

        {/* Hero Section Simulation */}
        <div 
          className="relative p-12 rounded-lg bg-cover bg-center min-h-[400px] flex items-center justify-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200')",
          }}
        >
          <div className="absolute inset-0 bg-blue-900/60 rounded-lg"></div>
          <div className="relative z-10 text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Nuestros Servicios</h2>
            <p className="text-lg max-w-2xl mx-auto">
              Unidades técnicas que aseguran excelencia en mantenimiento, 
              control y protección eléctrica.
            </p>
            <SlideArrowButton size="lg">
              Contáctanos
            </SlideArrowButton>
          </div>
        </div>

        {/* Dark Background */}
        <div className="bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Sobre Fondo Oscuro
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton>
              Contáctanos
            </SlideArrowButton>
            
            <SlideArrowButton 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              Más información
            </SlideArrowButton>
          </div>
        </div>

        {/* Multiple Buttons in Row */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Múltiples Botones
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton size="lg">
              Empezar ahora
            </SlideArrowButton>
            
            <SlideArrowButton variant="outline" size="lg">
              Ver demo
            </SlideArrowButton>
          </div>
        </div>

        {/* Full Width */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Ancho Completo
          </h2>
          <SlideArrowButton className="w-full">
            Botón de ancho completo
          </SlideArrowButton>
        </div>

        {/* Disabled State */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Estado Deshabilitado
          </h2>
          <div className="flex flex-wrap gap-4">
            <SlideArrowButton disabled className="opacity-50 cursor-not-allowed">
              Deshabilitado
            </SlideArrowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideArrowButtonExample;