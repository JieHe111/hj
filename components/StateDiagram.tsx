import React from 'react';
import { SystemMode } from '../types';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface StateDiagramProps {
  currentMode: SystemMode;
}

const StateDiagram: React.FC<StateDiagramProps> = ({ currentMode }) => {
  const getNodeClass = (mode: SystemMode) => {
    const isActive = currentMode === mode;
    const base = "w-24 h-24 rounded-full flex items-center justify-center text-center text-xs font-bold border-2 transition-all duration-500";
    if (isActive) {
      if (mode === SystemMode.NORMAL) return `${base} bg-green-500 text-white border-green-600 shadow-lg scale-110`;
      if (mode === SystemMode.FAULT) return `${base} bg-red-500 text-white border-red-600 shadow-lg scale-110`;
      if (mode === SystemMode.RESET) return `${base} bg-yellow-400 text-white border-yellow-600 shadow-lg scale-110`;
      if (mode === SystemMode.POWER_ON) return `${base} bg-blue-500 text-white border-blue-600 shadow-lg scale-110`;
      return base;
    }
    return `${base} bg-white text-gray-400 border-gray-200 grayscale`;
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-full">
      <h3 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">FTSM State Machine</h3>
      
      <div className="relative h-64 w-48">
        {/* Power On */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${getNodeClass(SystemMode.POWER_ON)}`}>
          Power On
        </div>

        {/* Arrow to Reset */}
        <ArrowDown className="absolute top-24 left-1/2 transform -translate-x-1/2 text-gray-300 w-6 h-6" />

        {/* Reset */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 ${getNodeClass(SystemMode.RESET)}`}>
          Reset
        </div>
        
        {/* Arrow to Normal */}
        <ArrowDown className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-gray-300 w-6 h-6" />

        {/* Normal */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${getNodeClass(SystemMode.NORMAL)}`}>
          Normal Work
        </div>

        {/* Fault Loop (conceptual) */}
         {currentMode === SystemMode.FAULT && (
             <div className="absolute top-0 right-0 transform translate-x-8 translate-y-24 bg-red-100 text-red-800 px-2 py-1 rounded text-xs border border-red-200">
                 Safety Fallback
             </div>
         )}
      </div>
    </div>
  );
};

export default StateDiagram;