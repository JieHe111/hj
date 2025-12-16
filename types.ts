export enum SystemMode {
  POWER_ON = 'POWER_ON',
  RESET = 'RESET',
  NORMAL = 'NORMAL',
  FAULT = 'FAULT'
}

export enum PipelineStage {
  IDLE = 'IDLE',
  INPUT = 'INPUT',
  SYNC_INPUT = 'SYNC_INPUT',
  PROCESS = 'PROCESS',
  SYNC_PROCESS = 'SYNC_PROCESS',
  OUTPUT = 'OUTPUT',
  SYNC_OUTPUT = 'SYNC_OUTPUT'
}

export interface PUState {
  id: number;
  data: number;
  isReady: boolean;
  status: 'IDLE' | 'WORKING' | 'WAITING' | 'ERROR';
  currentAction: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  source: 'PU1' | 'PU2' | 'FTSM' | 'SYSTEM';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface FaultConfig {
  dataMismatch: boolean; // Forces PU2 to produce wrong data
  syncDelay: boolean;    // Forces PU2 to lag behind (timeout simulation)
}