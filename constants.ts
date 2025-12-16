export const SIMULATION_SPEED_MS = 1000; // Base tick speed
export const SYNC_TIMEOUT_THRESHOLD = 3; // How many ticks to wait before declaring timeout

// Colors for visual feedback
export const STATUS_COLORS = {
  IDLE: 'bg-gray-100 border-gray-300 text-gray-500',
  WORKING: 'bg-blue-50 border-blue-400 text-blue-700',
  WAITING: 'bg-yellow-50 border-yellow-400 text-yellow-700',
  ERROR: 'bg-red-50 border-red-500 text-red-700',
  SUCCESS: 'bg-green-50 border-green-500 text-green-700',
};

export const STAGE_DESCRIPTIONS = {
  IDLE: "System Idle",
  INPUT: "Reading Input Sensors",
  SYNC_INPUT: "Synchronizing Input Data (Consistency Check)",
  PROCESS: "Executing Control Algorithm",
  SYNC_PROCESS: "Synchronizing Calculation Results",
  OUTPUT: "Writing Output Actuators",
  SYNC_OUTPUT: "Synchronizing Output States"
};