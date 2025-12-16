import React from 'react';
import { SystemMode, FaultConfig } from '../types';
import { Play, Pause, RotateCcw, Bug, ZapOff } from 'lucide-react';

interface ControlPanelProps {
  systemMode: SystemMode;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  faultConfig: FaultConfig;
  toggleFault: (key: keyof FaultConfig) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  systemMode,
  isRunning,
  onStart,
  onPause,
  onReset,
  faultConfig,
  toggleFault
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {!isRunning || systemMode === SystemMode.FAULT ? (
            <button
              onClick={onStart}
              disabled={systemMode === SystemMode.FAULT && !isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                systemMode === SystemMode.FAULT ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Play size={18} /> Start
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
            >
              <Pause size={18} /> Pause
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>

        {/* Fault Injection Panel */}
        <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <span className="text-xs font-bold text-red-800 uppercase px-2">Fault Injection:</span>
          
          <button
            onClick={() => toggleFault('dataMismatch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-all ${
              faultConfig.dataMismatch 
                ? 'bg-red-600 text-white shadow-inner' 
                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
            }`}
          >
            <Bug size={14} /> Data Mismatch
          </button>

          <button
            onClick={() => toggleFault('syncDelay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-all ${
              faultConfig.syncDelay 
                ? 'bg-red-600 text-white shadow-inner' 
                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
            }`}
          >
            <ZapOff size={14} /> Sync Loss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;