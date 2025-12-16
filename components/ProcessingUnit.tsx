import React from 'react';
import { PUState, SystemMode } from '../types';
import { STATUS_COLORS } from '../constants';
import { Cpu, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ProcessingUnitProps {
  unit: PUState;
  systemMode: SystemMode;
}

const ProcessingUnit: React.FC<ProcessingUnitProps> = ({ unit, systemMode }) => {
  const getIcon = () => {
    if (unit.status === 'ERROR' || systemMode === SystemMode.FAULT) return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (unit.status === 'WAITING') return <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
    if (unit.status === 'WORKING') return <Cpu className="w-6 h-6 text-blue-500 animate-spin-slow" />;
    return <CheckCircle2 className="w-6 h-6 text-gray-400" />;
  };

  const statusClass = systemMode === SystemMode.FAULT ? STATUS_COLORS.ERROR : STATUS_COLORS[unit.status];

  return (
    <div className={`relative flex flex-col items-center p-4 border-2 rounded-xl shadow-md transition-all duration-300 w-full md:w-64 ${statusClass}`}>
      <div className="absolute -top-3 bg-white px-2 font-bold text-sm border rounded shadow-sm">
        PU {unit.id}
      </div>
      
      <div className="mb-3">
        {getIcon()}
      </div>

      <div className="text-center space-y-2 w-full">
        <div className="text-xs uppercase tracking-wider font-semibold opacity-70">
          Status: {unit.status}
        </div>
        <div className="bg-white/50 p-2 rounded border border-black/5 w-full">
          <div className="text-xs text-gray-500">Current Value</div>
          <div className="font-mono text-xl font-bold">{unit.data}</div>
        </div>
        <div className="text-xs h-8 flex items-center justify-center text-center leading-tight">
          {unit.currentAction}
        </div>
      </div>
      
      {/* Visual connection point */}
      <div className="absolute -bottom-2 w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-sm z-10"></div>
    </div>
  );
};

export default ProcessingUnit;