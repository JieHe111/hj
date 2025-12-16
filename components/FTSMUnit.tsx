import React from 'react';
import { SystemMode, PipelineStage } from '../types';
import { STAGE_DESCRIPTIONS } from '../constants';
import { ShieldCheck, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

interface FTSMUnitProps {
  mode: SystemMode;
  stage: PipelineStage;
  message: string;
}

const FTSMUnit: React.FC<FTSMUnitProps> = ({ mode, stage, message }) => {
  let modeColor = 'bg-gray-100 border-gray-400';
  let Icon = Activity;

  switch (mode) {
    case SystemMode.POWER_ON:
      modeColor = 'bg-blue-100 border-blue-500 text-blue-800';
      Icon = Activity;
      break;
    case SystemMode.RESET:
      modeColor = 'bg-yellow-100 border-yellow-500 text-yellow-800';
      Icon = RefreshCw;
      break;
    case SystemMode.NORMAL:
      modeColor = 'bg-green-100 border-green-500 text-green-800';
      Icon = ShieldCheck;
      break;
    case SystemMode.FAULT:
      modeColor = 'bg-red-100 border-red-600 text-red-800';
      Icon = ShieldAlert;
      break;
  }

  return (
    <div className="relative flex flex-col items-center w-full max-w-lg mx-auto">
      {/* FTSM Box */}
      <div className={`z-20 w-full p-6 border-4 rounded-xl shadow-lg transition-colors duration-500 ${modeColor}`}>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 font-bold text-sm border rounded-full shadow-sm whitespace-nowrap">
          FTSM Unit (2oo2 Voter)
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold opacity-70">System Mode</span>
            <span className="text-lg font-bold">{mode.replace('_', ' ')}</span>
          </div>
          <Icon className={`w-10 h-10 ${mode === SystemMode.NORMAL ? 'animate-pulse' : ''}`} />
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-black/5 mb-2">
           <div className="text-xs font-bold text-gray-500 mb-1">PIPELINE STAGE</div>
           <div className="text-sm font-medium">{STAGE_DESCRIPTIONS[stage]}</div>
        </div>

        <div className="bg-black/80 text-green-400 font-mono text-xs p-2 rounded shadow-inner min-h-[2.5rem] flex items-center">
          <span className="mr-2">$</span> {message || "System Ready..."}
        </div>
      </div>

      {/* Connection Lines upward to PUs */}
      <div className="absolute -top-8 w-full flex justify-around -z-10 h-10">
         <div className={`w-1 ${mode === SystemMode.NORMAL ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
         <div className={`w-1 ${mode === SystemMode.NORMAL ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default FTSMUnit;