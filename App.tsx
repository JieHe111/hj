import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemMode, PipelineStage, PUState, LogEntry, FaultConfig } from './types';
import ProcessingUnit from './components/ProcessingUnit';
import FTSMUnit from './components/FTSMUnit';
import ControlPanel from './components/ControlPanel';
import LogViewer from './components/LogViewer';
import StateDiagram from './components/StateDiagram';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<SystemMode>(SystemMode.POWER_ON);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // PU States
  const [pu1, setPu1] = useState<PUState>({ id: 1, data: 0, isReady: false, status: 'IDLE', currentAction: 'Initializing...' });
  const [pu2, setPu2] = useState<PUState>({ id: 2, data: 0, isReady: false, status: 'IDLE', currentAction: 'Initializing...' });
  
  // FTSM Message
  const [ftsmMessage, setFtsmMessage] = useState("System Power On");

  // Fault Injection Configuration
  const [faultConfig, setFaultConfig] = useState<FaultConfig>({ dataMismatch: false, syncDelay: false });

  // Refs for simulation loop
  const logsRef = useRef<LogEntry[]>([]);
  const cycleCount = useRef(0);
  const waitCounter = useRef(0);

  // --- Logging Helper ---
  const addLog = (source: 'PU1' | 'PU2' | 'FTSM' | 'SYSTEM', message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString().split(' ')[0],
      source,
      message,
      type
    };
    logsRef.current = [...logsRef.current.slice(-50), newLog]; // Keep last 50
    setLogs(logsRef.current);
  };

  // --- Simulation Actions ---
  
  const generateData = () => Math.floor(Math.random() * 100);

  const resetSystem = () => {
    setIsRunning(false);
    setMode(SystemMode.POWER_ON);
    setPipelineStage(PipelineStage.IDLE);
    setPu1({ id: 1, data: 0, isReady: false, status: 'IDLE', currentAction: 'Waiting...' });
    setPu2({ id: 2, data: 0, isReady: false, status: 'IDLE', currentAction: 'Waiting...' });
    setFtsmMessage("System Reset. Click Start.");
    cycleCount.current = 0;
    waitCounter.current = 0;
    logsRef.current = [];
    setLogs([]);
    addLog('SYSTEM', 'System Reset Initiated', 'info');
  };

  const toggleFault = (key: keyof FaultConfig) => {
    setFaultConfig(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      addLog('SYSTEM', `${key} fault injection ${newState[key] ? 'ENABLED' : 'DISABLED'}`, 'warning');
      return newState;
    });
  };

  // --- Main Simulation Loop ---

  const tick = useCallback(() => {
    if (!isRunning) return;

    // 1. Power On -> Reset Transition
    if (mode === SystemMode.POWER_ON) {
      addLog('FTSM', 'Self-test passed. Transitioning to RESET.', 'info');
      setMode(SystemMode.RESET);
      setFtsmMessage("Initializing PUs...");
      return;
    }

    // 2. Reset -> Normal Transition
    if (mode === SystemMode.RESET) {
      if (cycleCount.current < 2) {
        cycleCount.current++; // Fake delay
        setPu1(prev => ({ ...prev, status: 'WORKING', currentAction: 'Booting...' }));
        setPu2(prev => ({ ...prev, status: 'WORKING', currentAction: 'Booting...' }));
      } else {
        setMode(SystemMode.NORMAL);
        setPipelineStage(PipelineStage.INPUT);
        addLog('FTSM', 'Initialization Complete. Entering NORMAL Mode.', 'success');
        setPu1(prev => ({ ...prev, status: 'IDLE' }));
        setPu2(prev => ({ ...prev, status: 'IDLE' }));
        cycleCount.current = 0;
      }
      return;
    }

    // 3. Normal Operation Cycle
    if (mode === SystemMode.NORMAL) {
      
      switch (pipelineStage) {
        case PipelineStage.INPUT:
          // Simulate Data Reading
          const inputData = generateData();
          setPu1(prev => ({ ...prev, data: inputData, status: 'WORKING', currentAction: 'Reading Sensors' }));
          
          // Fault: Data Mismatch
          const pu2Data = faultConfig.dataMismatch ? inputData + 5 : inputData;
          setPu2(prev => ({ ...prev, data: pu2Data, status: 'WORKING', currentAction: 'Reading Sensors' }));
          
          addLog('PU1', `Read Input: ${inputData}`, 'info');
          addLog('PU2', `Read Input: ${pu2Data}`, 'info');
          
          setPipelineStage(PipelineStage.SYNC_INPUT);
          break;

        case PipelineStage.SYNC_INPUT:
          // Fault: Sync Delay
          if (faultConfig.syncDelay && waitCounter.current < 4) {
             setPu1(prev => ({ ...prev, status: 'WAITING', isReady: true, currentAction: 'Waiting for Sync...' }));
             setPu2(prev => ({ ...prev, status: 'WORKING', isReady: false, currentAction: 'Lagging...' }));
             waitCounter.current++;
             addLog('FTSM', 'Waiting for PU2 synchronization...', 'warning');
             return; 
          }

          // Check Sync Timeout
          if (faultConfig.syncDelay && waitCounter.current >= 4) {
             setMode(SystemMode.FAULT);
             addLog('FTSM', 'CRITICAL: Synchronization Timeout on Input Stage!', 'error');
             setFtsmMessage("Safety Fallback: Sync Timeout");
             setPu2(prev => ({...prev, status: 'ERROR'}));
             return;
          }

          // Reset wait counter if we passed
          waitCounter.current = 0;

          setPu1(prev => ({ ...prev, status: 'WAITING', isReady: true }));
          setPu2(prev => ({ ...prev, status: 'WAITING', isReady: true }));

          // Compare Data
          if (pu1.data === pu2.data) {
             addLog('FTSM', 'Input Data Consistent. Sync OK.', 'success');
             setPipelineStage(PipelineStage.PROCESS);
             setFtsmMessage("Input Sync OK. Proceeding.");
          } else {
             setMode(SystemMode.FAULT);
             addLog('FTSM', `CRITICAL: Input Data Mismatch! PU1:${pu1.data} != PU2:${pu2.data}`, 'error');
             setFtsmMessage("Safety Fallback: Data Mismatch");
             setPu1(prev => ({...prev, status: 'ERROR'}));
             setPu2(prev => ({...prev, status: 'ERROR'}));
          }
          break;

        case PipelineStage.PROCESS:
          // Simulate Processing (e.g., * 2)
          const p1Res = pu1.data * 2;
          const p2Res = pu2.data * 2;

          setPu1(prev => ({ ...prev, data: p1Res, status: 'WORKING', currentAction: 'Running Algo' }));
          setPu2(prev => ({ ...prev, data: p2Res, status: 'WORKING', currentAction: 'Running Algo' }));
          
          addLog('PU1', `Processed: ${p1Res}`, 'info');
          setPipelineStage(PipelineStage.SYNC_PROCESS);
          break;

        case PipelineStage.SYNC_PROCESS:
          // Simplified sync check for process stage (reuse logic conceptually)
          if (pu1.data === pu2.data) {
            addLog('FTSM', 'Process Result Consistent. Sync OK.', 'success');
            setPipelineStage(PipelineStage.OUTPUT);
            setFtsmMessage("Process Sync OK.");
            setPu1(prev => ({ ...prev, status: 'WAITING' }));
            setPu2(prev => ({ ...prev, status: 'WAITING' }));
          } else {
            setMode(SystemMode.FAULT);
            addLog('FTSM', 'CRITICAL: Process Divergence detected!', 'error');
            setFtsmMessage("Safety Fallback: Algo Error");
          }
          break;

        case PipelineStage.OUTPUT:
          // Output to actuators
          setPu1(prev => ({ ...prev, status: 'WORKING', currentAction: 'Writing Output' }));
          setPu2(prev => ({ ...prev, status: 'WORKING', currentAction: 'Writing Output' }));
          setPipelineStage(PipelineStage.SYNC_OUTPUT);
          break;

        case PipelineStage.SYNC_OUTPUT:
           addLog('FTSM', 'Output States Verified. Cycle Complete.', 'success');
           setFtsmMessage("Cycle Complete. Waiting Next...");
           setPu1(prev => ({ ...prev, status: 'IDLE', isReady: false }));
           setPu2(prev => ({ ...prev, status: 'IDLE', isReady: false }));
           
           // Loop back
           setTimeout(() => {
              if (mode === SystemMode.NORMAL && isRunning) {
                  setPipelineStage(PipelineStage.INPUT);
              }
           }, 500);
           
           // Pause briefly to show completion state in the tick loop? 
           // In this structure, we just wait for next tick which handles INPUT.
           // However, let's force a 'wait' state visually by waiting one tick.
           setPipelineStage(PipelineStage.IDLE); 
           break;
        
        case PipelineStage.IDLE:
           setPipelineStage(PipelineStage.INPUT);
           break;
      }
    }

  }, [isRunning, mode, pipelineStage, pu1.data, pu2.data, faultConfig]);

  // --- Interval Timer ---
  useEffect(() => {
    const interval = setInterval(tick, 1500); // 1.5s per step for readability
    return () => clearInterval(interval);
  }, [tick]);


  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-gray-200">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">2oo2 Safety System Simulation</h1>
           <p className="text-gray-500 text-sm">Course Design: Dual-Modular Redundancy & FTSM</p>
        </div>
        <div className="mt-2 md:mt-0 px-3 py-1 bg-gray-100 rounded text-xs font-mono">
          System Status: <span className={`font-bold ${mode === SystemMode.FAULT ? 'text-red-600' : mode === SystemMode.NORMAL ? 'text-green-600' : 'text-blue-600'}`}>{mode}</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: State Machine Visualization */}
        <div className="lg:col-span-1">
           <StateDiagram currentMode={mode} />
        </div>

        {/* Center Col: The 2oo2 Architecture */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <ControlPanel 
              systemMode={mode}
              isRunning={isRunning}
              onStart={() => setIsRunning(true)}
              onPause={() => setIsRunning(false)}
              onReset={resetSystem}
              faultConfig={faultConfig}
              toggleFault={toggleFault}
           />

           <div className="relative bg-white p-8 rounded-xl shadow-lg border border-gray-200 min-h-[500px] flex flex-col justify-between">
              
              {/* Top Layer: PUs */}
              <div className="flex flex-col md:flex-row justify-around items-start gap-8 z-10">
                 <ProcessingUnit unit={pu1} systemMode={mode} />
                 <ProcessingUnit unit={pu2} systemMode={mode} />
              </div>

              {/* Middle Layer: Arrows & Sync Pulse */}
              <div className="flex-1 flex items-center justify-center my-4 relative">
                 {/* Visual Sync Lines */}
                 <div className={`absolute top-0 bottom-0 w-0.5 bg-gray-200 left-1/4 -z-0`}></div>
                 <div className={`absolute top-0 bottom-0 w-0.5 bg-gray-200 right-1/4 -z-0`}></div>
                 
                 {/* Horizontal Sync Bus */}
                 {pipelineStage.includes('SYNC') && mode === SystemMode.NORMAL && (
                    <div className="w-full h-1 bg-blue-400 absolute top-1/2 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 )}
              </div>

              {/* Bottom Layer: FTSM */}
              <div className="z-10">
                 <FTSMUnit mode={mode} stage={pipelineStage} message={ftsmMessage} />
              </div>

           </div>
        </div>
      </div>

      {/* Bottom: Logs */}
      <LogViewer logs={logs} />
      
    </div>
  );
};

export default App;