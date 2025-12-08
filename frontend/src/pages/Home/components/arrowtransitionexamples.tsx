import React from 'react';
import { ArrowTransitionButton } from './Arrowtransitionbutton';

export const ArrowTransitionButtonExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="space-y-12 max-w-5xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Arrow Transition Button
          </h1>
          <p className="text-slate-300 text-lg">
            La flecha recorre todo el botón mientras el fondo cambia de color
          </p>
        </div>

        {/* Hero Section Simulation */}
        <div className="relative p-16 rounded-2xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-white/10">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Nuestros Servicios</h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Unidades técnicas que aseguran excelencia en mantenimiento, 
              control y protección eléctrica.
            </p>
            <div className="pt-4">
              <ArrowTransitionButton 
                size="lg"
                hoverBgColor="bg-cyan-500"
                borderColor="border-cyan-400"
              >
                Contáctanos
              </ArrowTransitionButton>
            </div>
          </div>
        </div>

        {/* Different Sizes */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Diferentes Tamaños
          </h2>
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <ArrowTransitionButton 
              size="sm"
              hoverBgColor="bg-cyan-500"
              borderColor="border-cyan-400"
            >
              Pequeño
            </ArrowTransitionButton>
            
            <ArrowTransitionButton 
              size="md"
              hoverBgColor="bg-cyan-500"
              borderColor="border-cyan-400"
            >
              Mediano
            </ArrowTransitionButton>
            
            <ArrowTransitionButton 
              size="lg"
              hoverBgColor="bg-cyan-500"
              borderColor="border-cyan-400"
            >
              Grande
            </ArrowTransitionButton>
          </div>
        </div>

        {/* Different Colors */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Diferentes Colores
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <ArrowTransitionButton 
              hoverBgColor="bg-blue-600"
              borderColor="border-blue-400"
              className="text-blue-400"
            >
              Azul
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-purple-600"
              borderColor="border-purple-400"
              className="text-purple-400"
            >
              Morado
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-green-600"
              borderColor="border-green-400"
              className="text-green-400"
            >
              Verde
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-orange-600"
              borderColor="border-orange-400"
              className="text-orange-400"
            >
              Naranja
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-pink-600"
              borderColor="border-pink-400"
              className="text-pink-400"
            >
              Rosa
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-red-600"
              borderColor="border-red-400"
              className="text-red-400"
            >
              Rojo
            </ArrowTransitionButton>
          </div>
        </div>

        {/* Real Use Cases */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Casos de Uso Reales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg text-slate-300">Call to Action Principal</h3>
              <ArrowTransitionButton 
                size="lg"
                hoverBgColor="bg-cyan-500"
                borderColor="border-cyan-400"
                className="w-full text-cyan-400"
              >
                Comenzar Ahora
              </ArrowTransitionButton>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-slate-300">Explorar Servicios</h3>
              <ArrowTransitionButton 
                size="lg"
                hoverBgColor="bg-purple-600"
                borderColor="border-purple-400"
                className="w-full text-purple-400"
              >
                Ver Servicios
              </ArrowTransitionButton>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-slate-300">Contacto</h3>
              <ArrowTransitionButton 
                hoverBgColor="bg-blue-600"
                borderColor="border-blue-400"
                className="w-full text-blue-400"
              >
                Hablar con Ventas
              </ArrowTransitionButton>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-slate-300">Más Información</h3>
              <ArrowTransitionButton 
                hoverBgColor="bg-green-600"
                borderColor="border-green-400"
                className="w-full text-green-400"
              >
                Conocer Más
              </ArrowTransitionButton>
            </div>
          </div>
        </div>

        {/* Custom Icons */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Con Iconos Personalizados
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <ArrowTransitionButton 
              hoverBgColor="bg-cyan-500"
              borderColor="border-cyan-400"
              className="text-cyan-400"
              arrowIcon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            >
              Flecha Larga
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-purple-600"
              borderColor="border-purple-400"
              className="text-purple-400"
              arrowIcon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Flecha Rellena
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-green-600"
              borderColor="border-green-400"
              className="text-green-400"
              arrowIcon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Chevron
            </ArrowTransitionButton>
          </div>
        </div>

        {/* Multiple Buttons Together */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Botones Juntos
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <ArrowTransitionButton 
              size="lg"
              hoverBgColor="bg-cyan-500"
              borderColor="border-cyan-400"
              className="text-cyan-400"
            >
              Empezar Ahora
            </ArrowTransitionButton>
            
            <ArrowTransitionButton 
              size="lg"
              hoverBgColor="bg-purple-600"
              borderColor="border-purple-400"
              className="text-purple-400"
            >
              Ver Demo
            </ArrowTransitionButton>
          </div>
        </div>

        {/* Card with Button */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-bold text-white">
              ¿Listo para comenzar?
            </h3>
            <p className="text-slate-300 text-lg">
              Únete a miles de empresas que confían en nuestros servicios para mantener sus sistemas eléctricos en perfecto estado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <ArrowTransitionButton 
                size="lg"
                hoverBgColor="bg-cyan-500"
                borderColor="border-cyan-400"
                className="text-cyan-400"
              >
                Contáctanos Hoy
              </ArrowTransitionButton>
              
              <ArrowTransitionButton 
                size="lg"
                hoverBgColor="bg-slate-700"
                borderColor="border-slate-400"
                className="text-slate-400"
              >
                Más Información
              </ArrowTransitionButton>
            </div>
          </div>
        </div>

        {/* On Light Background Simulation */}
        <div className="bg-white p-12 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Sobre Fondo Claro
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <ArrowTransitionButton 
              hoverBgColor="bg-blue-600"
              borderColor="border-blue-600"
              className="text-blue-600"
            >
              Azul
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-purple-600"
              borderColor="border-purple-600"
              className="text-purple-600"
            >
              Morado
            </ArrowTransitionButton>

            <ArrowTransitionButton 
              hoverBgColor="bg-green-600"
              borderColor="border-green-600"
              className="text-green-600"
            >
              Verde
            </ArrowTransitionButton>
          </div>
        </div>

        {/* Disabled State */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Estado Deshabilitado
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <ArrowTransitionButton 
              disabled 
              className="opacity-40 cursor-not-allowed text-cyan-400"
              borderColor="border-cyan-400"
            >
              Botón Deshabilitado
            </ArrowTransitionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrowTransitionButtonExample;